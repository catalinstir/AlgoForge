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

  // Create a test file with the input data
  createInputFile(parsedInput) {
    // Convert the parsed input to a simple format that can be read by the main function
    const lines = [];
    
    for (const [key, value] of Object.entries(parsedInput)) {
      // For arrays/vectors, we write the size first, then the elements
      if (value.startsWith("{") && value.endsWith("}")) {
        const elements = value.slice(1, -1).split(",").map(item => item.trim());
        lines.push(`${key}_size=${elements.length}`);
        lines.push(`${key}=${value}`);
      } else {
        lines.push(`${key}=${value}`);
      }
    }
    
    return lines.join("\n");
  }

  // Replace user solution in the full source template
  injectUserCode(fullSourceTemplate, userCode) {
    // The template should have a marker for where to inject the user code
    // e.g., // USER_CODE_START and // USER_CODE_END
    const startMarker = "// USER_CODE_START";
    const endMarker = "// USER_CODE_END";
    
    const startIndex = fullSourceTemplate.indexOf(startMarker);
    const endIndex = fullSourceTemplate.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
      console.error("Template does not contain user code markers");
      // Fall back to simpler replacement strategy
      return fullSourceTemplate.replace(
        "class Solution {",
        "class Solution {\n" + userCode
      );
    }
    
    const beforeUserCode = fullSourceTemplate.substring(0, startIndex + startMarker.length);
    const afterUserCode = fullSourceTemplate.substring(endIndex);
    
    return beforeUserCode + "\n" + userCode + "\n" + afterUserCode;
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
  async runTestCase(code, testCase, functionName, fullSourceTemplate) {
    try {
      // Parse the input data
      const parsedInput = this.parseCppInput(testCase.input);
      
      // Create input file content
      const inputFileContent = this.createInputFile(parsedInput);
      
      // Inject the user code into the template
      const fullProgram = this.injectUserCode(fullSourceTemplate, code);
      
      // For debugging: log the generated program
      console.log("Generated C++ program:", fullProgram);

      // Execute the C++ code with the input file
      const result = await this.dockerService.executeCppCode(fullProgram, inputFileContent);

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
  async runAllTests(code, testCases, functionName, fullSourceTemplate) {
    const results = [];
    let testCasesPassed = 0;
    let totalExecutionTime = 0;

    // If no full source template is provided, use the fallback method
    if (!fullSourceTemplate) {
      console.warn("No full source template provided, using legacy method");
      // Create a default full source template with user code markers
      fullSourceTemplate = `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <sstream>
#include <unordered_map>
#include <fstream>

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

// USER_CODE_START
class Solution {
public:
    // Default implementation 
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        return {0, 1}; // Default implementation
    }
};
// USER_CODE_END

int main() {
    // Read input data from file
    std::ifstream inputFile("input.txt");
    if (!inputFile.is_open()) {
        std::cerr << "Failed to open input file" << std::endl;
        return 1;
    }

    // Parse input parameters
    std::unordered_map<std::string, std::string> params;
    std::string line;
    while (std::getline(inputFile, line)) {
        size_t delimiterPos = line.find("=");
        if (delimiterPos != std::string::npos) {
            std::string key = line.substr(0, delimiterPos);
            std::string value = line.substr(delimiterPos + 1);
            params[key] = value;
        }
    }
    inputFile.close();

    // Create solution instance
    Solution solution;
    
    // Process specific problem types based on function name
    if (params.find("nums") != params.end() && params.find("target") != params.end()) {
        // Two Sum problem
        std::string numsStr = params["nums"];
        int target = std::stoi(params["target"]);
        
        // Parse nums vector
        std::vector<int> nums;
        numsStr = numsStr.substr(1, numsStr.size() - 2); // Remove { }
        std::stringstream ss(numsStr);
        std::string item;
        while (std::getline(ss, item, ',')) {
            nums.push_back(std::stoi(item));
        }
        
        // Call solution
        std::vector<int> result = solution.twoSum(nums, target);
        
        // Output result
        std::cout << vectorToString(result) << std::endl;
    }
    else if (params.find("x") != params.end()) {
        // isPalindrome problem
        int x = std::stoi(params["x"]);
        bool result = solution.isPalindrome(x);
        std::cout << (result ? "true" : "false") << std::endl;
    }
    else {
        std::cerr << "Unknown problem type or missing parameters" << std::endl;
        return 1;
    }
    
    return 0;
}
`;
    }

    for (const testCase of testCases) {
      const result = await this.runTestCase(code, testCase, functionName, fullSourceTemplate);

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
