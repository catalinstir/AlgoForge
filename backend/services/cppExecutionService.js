// backend/services/cppExecutionService.js
const dockerService = require("./dockerService");

class CppExecutionService {
  constructor() {
    this.dockerService = dockerService;
  }

  // Parse input string into C++ data
  parseCppInput(input) {
    console.log("Parsing input:", input);

    const result = {};

    // Split by comma that's not inside brackets
    const parts = input.split(/,(?![^\[]*\])/);

    for (const part of parts) {
      // Extract variable name and value
      const match = part.trim().match(/(\w+)\s*=\s*(.*)/);
      if (match) {
        const [, name, value] = match;

        // Handle array values
        if (value.trim().startsWith("[") && value.trim().endsWith("]")) {
          // Extract array content and convert to C++ vector initialization
          const arrayContent = value.trim().slice(1, -1).trim();
          result[name] = `{${arrayContent}}`;
        } else {
          // Regular value
          result[name] = value.trim();
        }
      }
    }

    console.log("Parsed result:", result);
    return result;
  }

  // Create a complete C++ program from user code and test case
  createCppTestProgram(userCode, functionName, input) {
    // Parse the input to extract parameters
    const parsedInput = this.parseCppInput(input);

    // Check if userCode has 'using namespace std'
    const hasNamespace = userCode.includes("using namespace std");

    // If not, add it before the Solution class
    let processedCode = userCode;
    if (!hasNamespace) {
      processedCode = userCode.replace(
        "class Solution {",
        "using namespace std;\n\nclass Solution {"
      );
    }

    // Generate a main function based on function name
    let mainFunction;

    // Handle specific known problems
    if (functionName === "twoSum") {
      mainFunction = `
int main() {
    // Create test input for Two Sum problem
    std::vector<int> nums ${parsedInput.nums};
    int target = ${parsedInput.target};
    
    // Create solution instance and call the function
    Solution solution;
    std::vector<int> result = solution.${functionName}(nums, target);
    
    // Print result vectors directly
    std::cout << vectorToString(result) << std::endl;
    
    return 0;
}`;
    } else if (functionName === "isPalindrome") {
      mainFunction = `
int main() {
    // Create test input for Palindrome Number problem
    int x = ${parsedInput.x};
    
    // Create solution instance and call the function
    Solution solution;
    bool result = solution.${functionName}(x);
    
    // Print boolean result directly
    std::cout << (result ? "true" : "false") << std::endl;
    
    return 0;
}`;
    } else {
      // Generic case - create a type-specific output handler
      let functionCall = `solution.${functionName}(`;
      const paramNames = Object.keys(parsedInput);

      functionCall += paramNames.map((name) => name).join(", ");
      functionCall += ")";

      mainFunction = `
int main() {
    // Create test input for generic problem
    ${paramNames
      .map((name) => {
        // Try to infer variable type
        let type = "auto";
        if (parsedInput[name].startsWith("{")) {
          type = "std::vector<int>";
        } else if (
          parsedInput[name] === "true" ||
          parsedInput[name] === "false"
        ) {
          type = "bool";
        } else if (!isNaN(parseInt(parsedInput[name]))) {
          type = "int";
        }

        return `${type} ${name} = ${parsedInput[name]};`;
      })
      .join("\n    ")}
    
    // Create solution instance and call the function
    Solution solution;
    auto result = ${functionCall};
    
    // Use template specialization to handle different return types
    printResult(result);
    
    return 0;
}

// Helper to print different result types
template <typename T>
void printResult(const T& result) {
    std::cout << result << std::endl;
}

// Specialization for vectors
template <>
void printResult(const std::vector<int>& result) {
    std::cout << vectorToString(result) << std::endl;
}

// Specialization for booleans
template <>
void printResult(const bool& result) {
    std::cout << (result ? "true" : "false") << std::endl;
}`;
    }

    // Combine all the parts
    return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <sstream>
#include <unordered_map>

// Helper function to print vectors for debugging
template <typename T>
std::string vectorToString(const std::vector<T>& vec) {
    std::stringstream ss;
    ss << "[";
    for (size_t i = 0; i < vec.size(); ++i) {
        if (i > 0) ss << ",";
        ss << vec[i];
    }
    ss << "]";
    return ss.str();
}

${processedCode}

${mainFunction}
`;
  }

  // Normalize output for comparison
  normalizeOutput(output) {
    // Remove whitespace and standardize format
    return output
      .trim()
      .replace(/\s+/g, "") // Remove all whitespace
      .replace(/\[/g, "[") // Normalize brackets
      .replace(/\]/g, "]")
      .replace(/,/g, ","); // Normalize commas
  }

  // Run a single test case
  async runTestCase(code, testCase, functionName) {
    try {
      // Create a complete C++ program
      const fullProgram = this.createCppTestProgram(
        code,
        functionName,
        testCase.input
      );

      // For debugging: log the generated program
      console.log("Generated C++ program:", fullProgram);

      // Execute the C++ code
      const result = await this.dockerService.executeCppCode(fullProgram, "");

      // Check if execution was successful
      if (result.error) {
        return {
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: result.error,
          passed: false,
          hidden: testCase.isHidden || false,
          executionTime: result.executionTime,
          memoryUsed: 0,
          error: result.error,
          timedOut: result.timedOut,
        };
      }

      // Compare the result with expected output
      const normalizedExpected = this.normalizeOutput(testCase.output);
      const normalizedActual = this.normalizeOutput(result.output);

      const passed = normalizedExpected === normalizedActual;

      return {
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: result.output,
        passed,
        hidden: testCase.isHidden || false,
        executionTime: result.executionTime,
        memoryUsed: 0,
        error: null,
        timedOut: result.timedOut,
      };
    } catch (error) {
      console.error("Error running C++ test case:", error);
      return {
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: "Error executing code",
        passed: false,
        hidden: testCase.isHidden || false,
        executionTime: 0,
        memoryUsed: 0,
        error: error.message,
        timedOut: false,
      };
    }
  }

  // Run all test cases for a submission
  async runAllTests(code, testCases, functionName) {
    const results = [];
    let testCasesPassed = 0;
    let totalExecutionTime = 0;

    for (const testCase of testCases) {
      const result = await this.runTestCase(code, testCase, functionName);

      if (result.passed) {
        testCasesPassed++;
      }

      totalExecutionTime += result.executionTime;
      results.push(result);
    }

    return {
      testResults: results,
      testCasesPassed,
      totalTestCases: testCases.length,
      executionTime: Math.round(totalExecutionTime / testCases.length), // Average execution time
      status:
        testCasesPassed === testCases.length ? "Accepted" : "Wrong Answer",
    };
  }
}

module.exports = new CppExecutionService();
