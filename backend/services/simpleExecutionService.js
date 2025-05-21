const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const dockerService = require('./dockerService');

class SimpleExecutionService {
  constructor() {
    this.dockerService = dockerService;
    this.executionTimeout = process.env.CODE_EXECUTION_TIMEOUT_MS || 10000;
    this.tempDir = path.join(os.tmpdir(), 'algorush-executions');
    this.createTempDirIfNotExists();
  }

  async createTempDirIfNotExists() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
      throw new Error('Failed to initialize execution service');
    }
  }

  // Extract solution class code from user submission
  extractSolutionClass(code) {
    // This regex looks for the Solution class definition
    const solutionClassRegex = /class\s+Solution\s*\{[\s\S]*?\};/;
    const match = code.match(solutionClassRegex);
    
    if (!match) {
      throw new Error('Could not find Solution class in the submitted code');
    }
    
    return match[0];
  }

  // Replace Solution class in the whole source code
  replaceSolutionClass(wholeSource, solutionClass) {
    // This regex looks for the Solution class definition in the whole source
    const solutionClassRegex = /class\s+Solution\s*\{[\s\S]*?\};/;
    
    // Replace the Solution class with the user's implementation
    return wholeSource.replace(solutionClassRegex, solutionClass);
  }

  // Run all tests for a submission
  async runAllTests(code, problem, testCases) {
    try {
      // Extract the Solution class from user code
      const solutionClass = this.extractSolutionClass(code);
      
      // Get the whole source code for this problem
      const wholeSource = problem.wholeSource?.cpp || null;
      
      if (!wholeSource) {
        throw new Error('Problem does not have complete source code');
      }
      
      // Replace the Solution class in the whole source
      const completeCode = this.replaceSolutionClass(wholeSource, solutionClass);
      
      // Run each test case
      const results = [];
      let testCasesPassed = 0;
      let totalExecutionTime = 0;
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`Running test case ${i+1}/${testCases.length}`);
        
        const testResult = await this.runTest(completeCode, testCase);
        totalExecutionTime += testResult.executionTime;
        
        if (testResult.passed) {
          testCasesPassed++;
        }
        
        results.push(testResult);
      }
      
      return {
        testResults: results,
        testCasesPassed,
        totalTestCases: testCases.length,
        executionTime: Math.round(totalExecutionTime), 
        status: testCasesPassed === testCases.length ? "Accepted" : "Wrong Answer"
      };
      
    } catch (error) {
      console.error('Error running tests:', error);
      return {
        testResults: [],
        testCasesPassed: 0,
        totalTestCases: testCases.length,
        executionTime: 0,
        status: "Error",
        error: error.message
      };
    }
  }

  // Run a single test case
  async runTest(completeCode, testCase) {
    const executionId = uuidv4();
    const executionDir = path.join(this.tempDir, executionId);
    
    try {
      // Create execution directory
      await fs.mkdir(executionDir, { recursive: true });
      
      // Write complete code to file
      const sourcePath = path.join(executionDir, 'solution.cpp');
      await fs.writeFile(sourcePath, completeCode);
      
      // Write test input to a file
      const inputPath = path.join(executionDir, 'input.txt');
      await fs.writeFile(inputPath, testCase.input);
      
      // Compile the code
      console.log('Compiling code...');
      const compileResult = await this.compileCode(executionDir);
      
      if (compileResult.error) {
        console.error('Compilation error:', compileResult.error);
        return {
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: `Compilation error: ${compileResult.error}`,
          passed: false,
          hidden: testCase.isHidden || false,
          executionTime: compileResult.executionTime,
          memoryUsed: 0
        };
      }
      
      // Run the compiled code
      console.log('Running code...');
      const runResult = await this.runCode(executionDir);
      
      const totalExecutionTime = compileResult.executionTime + runResult.executionTime;
      
      // Compare output
      const normalizedExpected = this.normalizeOutput(testCase.output);
      const normalizedActual = this.normalizeOutput(runResult.stdout);
      const passed = normalizedExpected === normalizedActual;
      
      // Clean up execution directory after a delay
      setTimeout(async () => {
        try {
          await fs.rm(executionDir, { recursive: true, force: true });
        } catch (err) {
          console.error(`Failed to clean up execution directory ${executionDir}:`, err);
        }
      }, 5000);
      
      return {
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: runResult.stdout.trim(),
        passed,
        hidden: testCase.isHidden || false,
        executionTime: totalExecutionTime,
        memoryUsed: 0,
        error: runResult.stderr || null
      };
      
    } catch (error) {
      console.error('Error running test:', error);
      
      // Clean up execution directory
      try {
        await fs.rm(executionDir, { recursive: true, force: true });
      } catch (err) {
        console.error(`Failed to clean up execution directory ${executionDir}:`, err);
      }
      
      return {
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: "Execution error",
        passed: false,
        hidden: testCase.isHidden || false,
        executionTime: 0,
        memoryUsed: 0,
        error: error.message
      };
    }
  }

  // Compile the code
  async compileCode(executionDir) {
    const compileCmd = [
      'run', '--rm', '--network=none',
      '--memory=100m', '--cpus=0.5',
      '--ulimit', 'nproc=10:10',
      '-v', `${executionDir}:/app`,
      '-w', '/app', 
      '--name', `algorush-compile-${uuidv4().substring(0, 8)}`,
      'gcc:11.2',
      'g++', '-o', 'solution', 'solution.cpp', '-std=c++17'
    ];
    
    try {
      const result = await this.dockerService.runCommand(compileCmd, executionDir, this.executionTimeout);
      
      if (result.exitCode !== 0) {
        return {
          error: result.stderr,
          executionTime: result.executionTime
        };
      }
      
      return {
        error: null,
        executionTime: result.executionTime
      };
    } catch (error) {
      return {
        error: error.message,
        executionTime: 0
      };
    }
  }

  // Run the compiled code
  async runCode(executionDir) {
    const runCmd = [
      'run', '--rm', '--network=none',
      '--memory=100m', '--cpus=0.5',
      '--ulimit', 'nproc=10:10',
      '-v', `${executionDir}:/app`,
      '-w', '/app',
      '--name', `algorush-run-${uuidv4().substring(0, 8)}`,
      'gcc:11.2',
      './solution'
    ];
    
    try {
      const startTime = Date.now();
      const result = await this.dockerService.runCommand(runCmd, executionDir, this.executionTimeout);
      const executionTime = Date.now() - startTime;
      
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        timedOut: result.timedOut,
        executionTime
      };
    } catch (error) {
      return {
        stdout: '',
        stderr: error.message,
        exitCode: 1,
        timedOut: false,
        executionTime: 0
      };
    }
  }
  
  // Normalize output for comparison
  normalizeOutput(output) {
    return output
      .trim()
      .replace(/\s+/g, '')  // Remove all whitespace
      .replace(/\[/g, '[')  // Normalize brackets
      .replace(/\]/g, ']')
      .replace(/,/g, ',');  // Normalize commas
  }
}

module.exports = new SimpleExecutionService();
