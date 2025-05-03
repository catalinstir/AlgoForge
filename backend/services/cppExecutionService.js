const dockerService = require('./dockerService');

class CppExecutionService {
  constructor() {
    this.dockerService = dockerService;
  }
  
  // Parse input string into C++ data
  parseCppInput(input, functionName) {
    // Handle common formats like "nums = [2,7,11,15], target = 9"
    // This is a simplified version and may need adjustment based on your exact input format
    let cleanInput = input.trim();

    // Process array inputs like "[2,7,11,15]"
    cleanInput = cleanInput.replace(/\[([^\]]*)\]/g, (match, p1) => {
      // Convert array to C++ vector initialization
      return `{${p1}}`;
    });

    // Handle variable assignments by removing the variable names
    cleanInput = cleanInput.replace(/\b\w+\s*=\s*/g, '');
    
    return cleanInput;
  }

  // Create a complete C++ program from user code and test case
  createCppTestProgram(userCode, functionName, input) {
    // Parse the input to extract parameters
    const parsedInput = this.parseCppInput(input, functionName);
    
    // We need to wrap the user code with test harness and main function
    // This is specific to your problem format - adjust as needed
    return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <sstream>

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

${userCode}

int main() {
    // Create test input
    std::vector<int> nums ${parsedInput.split(',')[0]};
    int target = ${parsedInput.split(',')[1].trim()};
    
    // Create solution instance and run test
    Solution solution;
    std::vector<int> result = solution.${functionName}(nums, target);
    
    // Print result
    std::cout << vectorToString(result) << std::endl;
    
    return 0;
}
`;
  }

  // Normalize output for comparison
  normalizeOutput(output) {
    // Remove whitespace and standardize format
    return output.trim()
      .replace(/\s+/g, '')  // Remove all whitespace
      .replace(/\[/g, '[')  // Normalize brackets
      .replace(/\]/g, ']')
      .replace(/,/g, ',');  // Normalize commas
  }

  // Run a single test case
  async runTestCase(code, testCase, functionName) {
    try {
      // Create a complete C++ program
      const fullProgram = this.createCppTestProgram(code, functionName, testCase.input);
      
      // Execute the C++ code
      const result = await this.dockerService.executeCppCode(fullProgram, '');
      
      // Check if execution was successful
      if (result.error) {
        return {
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: result.error,
          passed: false,
          hidden: testCase.isHidden || false,
          executionTime: result.executionTime,
          memoryUsed: 0, // Actual memory usage would require additional Docker stats
          error: result.error,
          timedOut: result.timedOut
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
        timedOut: result.timedOut
      };
    } catch (error) {
      console.error('Error running C++ test case:', error);
      return {
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: 'Error executing code',
        passed: false,
        hidden: testCase.isHidden || false,
        executionTime: 0,
        memoryUsed: 0,
        error: error.message,
        timedOut: false
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
      status: testCasesPassed === testCases.length ? "Accepted" : "Wrong Answer"
    };
  }
}

module.exports = new CppExecutionService();
