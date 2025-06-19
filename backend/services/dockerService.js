const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const os = require('os');

class DockerService {
  constructor() {
    this.executionTimeoutMs = process.env.CODE_EXECUTION_TIMEOUT_MS || 10000; // 10 seconds timeout
    this.tempDir = path.join(os.tmpdir(), 'algorush-executions');
    this.createTempDirIfNotExists();
  }

  async createTempDirIfNotExists() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
      throw new Error('Failed to initialize docker service');
    }
  }

  // Execute C++ code
  async executeCppCode(code, input) {
    const executionId = uuidv4();
    const executionDir = path.join(this.tempDir, executionId);
    
    try {
      await fs.mkdir(executionDir, { recursive: true });
      await fs.writeFile(path.join(executionDir, 'solution.cpp'), code);
      await fs.writeFile(path.join(executionDir, 'input.txt'), input);

      // Compile the code
      const compileCmd = [
        'run', '--rm', '--network=none', '--memory=256m', '--cpus=1.0',
        '--ulimit', 'nproc=50:50',
        '-v', `${executionDir}:/app`, '-w', '/app',
        '--name', `algorush-compile-${executionId}`,
        'gcc:11.2',
        'g++', '-o', 'solution', 'solution.cpp', '-std=c++17', '-O2'
      ];

      const compileResult = await this.runCommand(compileCmd, executionDir, this.executionTimeoutMs);
      
      if (compileResult.exitCode !== 0) {
        return {
          output: '',
          error: `Compilation error: ${compileResult.stderr}`,
          executionTime: compileResult.executionTime,
          timedOut: compileResult.timedOut,
          exitCode: compileResult.exitCode
        };
      }
      
      // Execute the compiled binary (program reads from input.txt)
      const runCmd = [
        'run', '--rm', '--network=none', '--memory=256m', '--cpus=1.0',
        '--ulimit', 'nproc=50:50',
        '-v', `${executionDir}:/app`, '-w', '/app',
        '--name', `algorush-run-${executionId}`,
        'gcc:11.2',
        'timeout', '5s', './solution'
      ];
      
      const runResult = await this.runCommand(runCmd, executionDir, this.executionTimeoutMs);
      
      return {
        output: runResult.stdout,
        error: runResult.stderr,
        executionTime: compileResult.executionTime + runResult.executionTime,
        timedOut: runResult.timedOut,
        exitCode: runResult.exitCode
      };
    } catch (error) {
      console.error('Docker C++ execution error:', error);
      return {
        output: '',
        error: error.message,
        timedOut: false,
        exitCode: 1
      };
    } finally {
      setTimeout(async () => {
        try {
          await fs.rm(executionDir, { recursive: true, force: true });
        } catch (err) {
          console.error(`Failed to clean up execution directory ${executionDir}:`, err);
        }
      }, 5000);
    }
  }

  // Execute Python code
  async executePythonCode(code, input) {
    const executionId = uuidv4();
    const executionDir = path.join(this.tempDir, executionId);
    
    try {
      await fs.mkdir(executionDir, { recursive: true });
      await fs.writeFile(path.join(executionDir, 'solution.py'), code);
      await fs.writeFile(path.join(executionDir, 'input.txt'), input);

      // Execute the Python code (program reads from input.txt)
      const runCmd = [
        'run', '--rm', '--network=none', '--memory=256m', '--cpus=1.0',
        '--ulimit', 'nproc=50:50',
        '-v', `${executionDir}:/app`, '-w', '/app',
        '--name', `algorush-python-${executionId}`,
        'python:3.9-slim',
        'timeout', '5s', 'python', 'solution.py'
      ];
      
      const runResult = await this.runCommand(runCmd, executionDir, this.executionTimeoutMs);
      
      return {
        output: runResult.stdout,
        error: runResult.stderr,
        executionTime: runResult.executionTime,
        timedOut: runResult.timedOut,
        exitCode: runResult.exitCode
      };
    } catch (error) {
      console.error('Docker Python execution error:', error);
      return {
        output: '',
        error: error.message,
        timedOut: false,
        exitCode: 1
      };
    } finally {
      setTimeout(async () => {
        try {
          await fs.rm(executionDir, { recursive: true, force: true });
        } catch (err) {
          console.error(`Failed to clean up execution directory ${executionDir}:`, err);
        }
      }, 5000);
    }
  }

  // Execute JavaScript code (Node.js)
  async executeJavaScriptCode(code, input) {
    const executionId = uuidv4();
    const executionDir = path.join(this.tempDir, executionId);
    
    try {
      await fs.mkdir(executionDir, { recursive: true });
      await fs.writeFile(path.join(executionDir, 'solution.js'), code);
      await fs.writeFile(path.join(executionDir, 'input.txt'), input);

      // Execute the JavaScript code (program reads from input.txt)
      const runCmd = [
        'run', '--rm', '--network=none', '--memory=256m', '--cpus=1.0',
        '--ulimit', 'nproc=50:50',
        '-v', `${executionDir}:/app`, '-w', '/app',
        '--name', `algorush-js-${executionId}`,
        'node:18-slim',
        'timeout', '5s', 'node', 'solution.js'
      ];
      
      const runResult = await this.runCommand(runCmd, executionDir, this.executionTimeoutMs);
      
      return {
        output: runResult.stdout,
        error: runResult.stderr,
        executionTime: runResult.executionTime,
        timedOut: runResult.timedOut,
        exitCode: runResult.exitCode
      };
    } catch (error) {
      console.error('Docker JavaScript execution error:', error);
      return {
        output: '',
        error: error.message,
        timedOut: false,
        exitCode: 1
      };
    } finally {
      setTimeout(async () => {
        try {
          await fs.rm(executionDir, { recursive: true, force: true });
        } catch (err) {
          console.error(`Failed to clean up execution directory ${executionDir}:`, err);
        }
      }, 5000);
    }
  }

  // Helper to run a command with timeout
  async runCommand(args, cwd, timeout) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let stdout = '';
      let stderr = '';
      let timedOut = false;
      
      const process = spawn('docker', args, { cwd });
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      const timeoutId = setTimeout(() => {
        timedOut = true;
        try {
          // Find container name from args
          const nameIndex = args.indexOf('--name');
          if (nameIndex !== -1 && nameIndex + 1 < args.length) {
            const containerName = args[nameIndex + 1];
            spawn('docker', ['kill', containerName]);
          }
        } catch (err) {
          console.error('Error killing docker container:', err);
        }
        process.kill();
      }, timeout);
      
      process.on('exit', (exitCode) => {
        clearTimeout(timeoutId);
        const executionTime = Date.now() - startTime;
        
        resolve({
          stdout,
          stderr,
          exitCode,
          timedOut,
          executionTime
        });
      });
    });
  }
}

module.exports = new DockerService();
