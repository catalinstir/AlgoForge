const dockerService = require('./dockerService');

class ExecutionService {
  constructor() {
    this.dockerService = dockerService;
  }

  // Process the test case input to match the language format
  formatTestInput(input, language, functionName) {
    // Clean input of any "variable = " prefixes
    let cleanInput = input.replace(/\w+\s*=\s*/g, '');
    
    // Language-specific formatting
    switch (language) {
      case 'javascript':
        return `
          ${functionName}(${cleanInput});
          console.log(${functionName}(${cleanInput}));
        `;
      
      case 'python':
        return `
          def main():
              result = ${functionName}(${cleanInput})
              print(result)
          
          if __name__ == "__main__":
              main()
        `;
      
      case 'cpp':
        return `
          #include <iostream>
          #include <vector>
          #include <string>
          using namespace std;
          
          // User solution will be inserted here
          
          int main() {
              auto result = ${functionName}(${cleanInput});
              // Handle different return types
              cout << result << endl;
              return 0;
          }
        `;
      
      case 'java':
        return `
          public class Solution {
              public static void main(String[] args) {
                  Solution solution = new Solution();
                  System.out.println(solution.${functionName}(${cleanInput}));
              }
              
              // User solution will be inserted here
          }
        `;
      
      default:
        return input;
    }
  }

  // Prepare code by wrapping user solution with test harness
  prepareCode(code, language, functionName, testInput) {
    switch (language) {
      case 'javascript':
        return `
          ${code}
          
          ${this.formatTestInput(testInput, language, functionName)}
        `;
      
      case 'python':
        return `
          ${code}
          
          ${this.formatTestInput(testInput, language, functionName)}
        `;
      
      case 'cpp':
        // For C++, we need to insert the code into the template
        return this.formatTestInput(testInput, language, functionName)
          .replace('// User solution will be inserted here', code);
      
      case 'java':
        // For Java, we need to insert the code into the template
        return this.formatTestInput(testInput, language, functionName)
          .replace('// User solution will be inserted here', code);
      
      default:
        return code;
    }
  }

  // Normalize output for comparison
  normalizeOutput(output) {
    return output.trim()
      .replace(/\r\n/g, '\n')      // Normalize line endings
      .replace(/\n+/g, '\n')       // Remove multiple newlines
      .replace(/"/g, '"')          // Normalize quotes
      .replace(/'/g, "'")          // Normalize single quotes
      .replace(/\s+/g, ' ')        // Normalize whitespace
      .replace(/\[\s+/g, '[')      // Remove space after [
      .replace(/\s+\]/g, ']')      // Remove space before ]
      .replace(/,\s+/g, ',')       // Remove space after comma
      .replace(/\(\s+/g, '(')      // Remove space after (
      .replace(/\s+\)/g, ')')      // Remove space before )
      .replace(/true/i, 'true')    // Normalize boolean
      .replace(/false/i, 'false'); // Normalize boolean
  }

  // Compare expected and actual outputs
  compareOutputs(expected, actual) {
    const normalizedExpected = this.normalizeOutput(expected);
    const normalizedActual = this.normalizeOutput(actual);
    
    return normalizedExpected === normalizedActual;
  }

  // Run a single test case
  async runTestCase(code, language, testCase, functionName) {
    const preparedCode = this.prepareCode(code, language, functionName, testCase.input);
    
    // No input needed as we've embedded the test case in the code
    const result = await this.dockerService.executeCode(preparedCode, language, '');
    
    const passed = result.error ? false : this.compareOutputs(testCase.output, result.output);
    
    return {
      input: testCase.input,
      expectedOutput: testCase.output,
      actualOutput: result.error || result.output,
      passed,
      hidden: testCase.isHidden || false,
      executionTime: result.executionTime,
      memoryUsed: 0, // Actual memory usage would require additional Docker stats
      error: result.error || null,
      timedOut: result.timedOut
    };
  }

  // Run all test cases for a submission
  async runAllTests(code, language, testCases, functionName) {
    const results = [];
    let testCasesPassed = 0;
    let totalExecutionTime = 0;
    
    for (const testCase of testCases) {
      const result = await this.runTestCase(code, language, testCase, functionName);
      
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

module.exports = new ExecutionService();
