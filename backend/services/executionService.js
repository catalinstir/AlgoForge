const dockerService = require("./dockerService");

class ExecutionService {
  constructor() {
    this.dockerService = dockerService;
  }

  // Normalize output for comparison
  normalizeOutput(output) {
    return output
      .trim()
      .replace(/\r\n/g, '\n')      // Normalize line endings
      .replace(/\n+$/, '')         // Remove trailing newlines
      .replace(/^\n+/, '');        // Remove leading newlines
  }

  // Run a single test case for C++
  async runCppTestCase(code, testCase) {
    try {
      // Execute the C++ code directly - it reads from input.txt
      const result = await this.dockerService.executeCppCode(code, testCase.input);

      // Check if execution was successful
      if (result.error && result.exitCode !== 0) {
        return {
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: result.error,
          passed: false,
          hidden: testCase.isHidden || false,
          executionTime: result.executionTime || 0,
          memoryUsed: 0,
          error: result.error,
          timedOut: result.timedOut || false,
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
        executionTime: result.executionTime || 0,
        memoryUsed: 0,
        error: result.stderr || null,
        timedOut: result.timedOut || false,
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

  // Run a single test case for Python
  async runPythonTestCase(code, testCase) {
    try {
      // Execute the Python code directly - it reads from input.txt
      const result = await this.dockerService.executePythonCode(code, testCase.input);

      if (result.error && result.exitCode !== 0) {
        return {
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: result.error,
          passed: false,
          hidden: testCase.isHidden || false,
          executionTime: result.executionTime || 0,
          memoryUsed: 0,
          error: result.error,
          timedOut: result.timedOut || false,
        };
      }

      const normalizedExpected = this.normalizeOutput(testCase.output);
      const normalizedActual = this.normalizeOutput(result.output);
      const passed = normalizedExpected === normalizedActual;

      return {
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: result.output,
        passed,
        hidden: testCase.isHidden || false,
        executionTime: result.executionTime || 0,
        memoryUsed: 0,
        error: result.stderr || null,
        timedOut: result.timedOut || false,
      };
    } catch (error) {
      console.error("Error running Python test case:", error);
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

  // Run a single test case for JavaScript
  async runJavaScriptTestCase(code, testCase) {
    try {
      // Handle special cases like "empty" string
      let actualInput = testCase.input;
      if (testCase.input === "empty") {
        actualInput = "";
      }

      const result = await this.dockerService.executeJavaScriptCode(code, actualInput);

      if (result.error && result.exitCode !== 0) {
        return {
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: result.error,
          passed: false,
          hidden: testCase.isHidden || false,
          executionTime: result.executionTime || 0,
          memoryUsed: 0,
          error: result.error,
          timedOut: result.timedOut || false,
        };
      }

      const normalizedExpected = this.normalizeOutput(testCase.output);
      const normalizedActual = this.normalizeOutput(result.output);
      const passed = normalizedExpected === normalizedActual;

      return {
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: result.output,
        passed,
        hidden: testCase.isHidden || false,
        executionTime: result.executionTime || 0,
        memoryUsed: 0,
        error: result.stderr || null,
        timedOut: result.timedOut || false,
      };
    } catch (error) {
      console.error("Error running JavaScript test case:", error);
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
  async runAllTests(code, testCases, language) {
    const results = [];
    let testCasesPassed = 0;
    let totalExecutionTime = 0;

    for (const testCase of testCases) {
      let result;
      
      switch (language) {
        case 'cpp':
          result = await this.runCppTestCase(code, testCase);
          break;
        case 'python':
          result = await this.runPythonTestCase(code, testCase);
          break;
        case 'javascript':
          result = await this.runJavaScriptTestCase(code, testCase);
          break;
        case 'java':
          // TODO: Implement Java execution when dockerService supports it
          result = {
            input: testCase.input,
            expectedOutput: testCase.output,
            actualOutput: "Java execution not yet implemented",
            passed: false,
            hidden: testCase.isHidden || false,
            executionTime: 0,
            memoryUsed: 0,
            error: "Language not supported yet",
            timedOut: false,
          };
          break;
        default:
          result = {
            input: testCase.input,
            expectedOutput: testCase.output,
            actualOutput: "Unsupported language",
            passed: false,
            hidden: testCase.isHidden || false,
            executionTime: 0,
            memoryUsed: 0,
            error: "Unsupported language",
            timedOut: false,
          };
      }

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
      executionTime: testCases.length > 0 ? Math.round(totalExecutionTime / testCases.length) : 0,
      status: testCasesPassed === testCases.length ? "Accepted" : "Wrong Answer",
    };
  }
}

module.exports = new ExecutionService();
