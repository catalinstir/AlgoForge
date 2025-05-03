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

  // For now, focus on C++ only
  async executeCppCode(code, input) {
    // Create a unique execution ID
    const executionId = uuidv4();
    const executionDir = path.join(this.tempDir, executionId);
    
    try {
      // Create execution directory
      await fs.mkdir(executionDir, { recursive: true });
      
      // Write code file
      await fs.writeFile(path.join(executionDir, 'solution.cpp'), code);
      
      // Write input file
      await fs.writeFile(path.join(executionDir, 'input.txt'), input);

      // Create docker run command for compilation
      const compileCmd = [
        'run',
        '--rm',                       // Remove container after execution
        '--network=none',             // No network access
        '--memory=100m',              // Memory limit
        '--cpus=0.5',                 // CPU limit
        '--ulimit', 'nproc=10:10',    // Process limit
        '-v', `${executionDir}:/app`, // Mount execution directory
        '-w', '/app',                 // Set working directory
        '--name', `algorush-compile-${executionId}`,
        'gcc:11.2',
        'g++', '-o', 'solution', 'solution.cpp', '-std=c++17'
      ];

      // Compile the code
      const compileResult = await this.runCommand(compileCmd, executionDir, this.executionTimeoutMs);
      
      // If compilation failed, return the error
      if (compileResult.exitCode !== 0) {
        return {
          output: '',
          error: `Compilation error: ${compileResult.stderr}`,
          executionTime: compileResult.executionTime,
          timedOut: compileResult.timedOut,
          exitCode: compileResult.exitCode
        };
      }
      
      // Execute the compiled binary
      const runCmd = [
        'run',
        '--rm',                       // Remove container after execution
        '--network=none',             // No network access
        '--memory=100m',              // Memory limit
        '--cpus=0.5',                 // CPU limit
        '--ulimit', 'nproc=10:10',    // Process limit
        '-v', `${executionDir}:/app`, // Mount execution directory
        '-w', '/app',                 // Set working directory
        '--name', `algorush-run-${executionId}`,
        'gcc:11.2',
        'sh', '-c', './solution < input.txt'
      ];
      
      // Run the executable
      const runResult = await this.runCommand(runCmd, executionDir, this.executionTimeoutMs);
      
      return {
        output: runResult.stdout,
        error: runResult.stderr,
        executionTime: compileResult.executionTime + runResult.executionTime,
        timedOut: runResult.timedOut,
        exitCode: runResult.exitCode
      };
    } catch (error) {
      console.error('Docker execution error:', error);
      return {
        output: '',
        error: error.message,
        timedOut: false,
        exitCode: 1
      };
    } finally {
      // Clean up execution directory after a delay
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
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        timedOut = true;
        try {
          // Try to kill the container
          spawn('docker', ['kill', `algorush-${args[args.indexOf('--name') + 1]}`]);
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
