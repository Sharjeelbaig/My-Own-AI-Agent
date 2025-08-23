import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function automationTool(input) {
    try {
        const request = JSON.parse(input);
        const { action, projectPath, dependencies, commands } = request;

        let result = {};

        switch (action) {
            case 'install_dependencies':
                result = await installDependencies(projectPath, dependencies);
                break;
            
            case 'run_commands':
                result = await runCommands(projectPath, commands);
                break;
            
            case 'setup_project':
                result = await setupProject(projectPath, dependencies, commands);
                break;
            
            case 'create_directory':
                result = await createDirectory(projectPath);
                break;
            
            default:
                result = {
                    success: false,
                    error: `Unknown automation action: ${action}`
                };
        }

        return JSON.stringify(result, null, 2);
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.message,
            message: 'Automation task failed'
        }, null, 2);
    }
}

async function installDependencies(projectPath, dependencies) {
    try {
        if (!dependencies || dependencies.length === 0) {
            return {
                success: true,
                message: 'No dependencies to install',
                skipped: true
            };
        }

        // Check if it's a Node.js project
        const packageJsonPath = path.join(projectPath, 'package.json');
        const hasPackageJson = await fs.pathExists(packageJsonPath);

        if (hasPackageJson) {
            // Install npm dependencies
            const npmInstallCommand = `cd "${projectPath}" && npm install ${dependencies.join(' ')}`;
            const { stdout, stderr } = await execAsync(npmInstallCommand);
            
            return {
                success: true,
                message: 'NPM dependencies installed successfully',
                dependencies: dependencies,
                output: stdout,
                error: stderr || null
            };
        }

        // Check if it's a Python project
        const pythonFiles = await fs.readdir(projectPath);
        const hasPythonFiles = pythonFiles.some(file => file.endsWith('.py'));

        if (hasPythonFiles) {
            // Install pip dependencies
            const pipInstallCommand = `cd "${projectPath}" && pip install ${dependencies.join(' ')}`;
            const { stdout, stderr } = await execAsync(pipInstallCommand);
            
            return {
                success: true,
                message: 'Pip dependencies installed successfully',
                dependencies: dependencies,
                output: stdout,
                error: stderr || null
            };
        }

        return {
            success: false,
            message: 'Could not determine project type for dependency installation',
            projectPath: projectPath
        };

    } catch (error) {
        return {
            success: false,
            error: error.message,
            message: 'Failed to install dependencies'
        };
    }
}

async function runCommands(projectPath, commands) {
    try {
        if (!commands || commands.length === 0) {
            return {
                success: true,
                message: 'No commands to run',
                skipped: true
            };
        }

        const results = [];

        for (const command of commands) {
            try {
                const fullCommand = `cd "${projectPath}" && ${command}`;
                const { stdout, stderr } = await execAsync(fullCommand);
                
                results.push({
                    command: command,
                    success: true,
                    output: stdout,
                    error: stderr || null
                });
            } catch (error) {
                results.push({
                    command: command,
                    success: false,
                    error: error.message
                });
            }
        }

        const allSuccessful = results.every(result => result.success);

        return {
            success: allSuccessful,
            message: allSuccessful ? 'All commands executed successfully' : 'Some commands failed',
            commands: results,
            projectPath: projectPath
        };

    } catch (error) {
        return {
            success: false,
            error: error.message,
            message: 'Failed to run commands'
        };
    }
}

async function setupProject(projectPath, dependencies, commands) {
    try {
        // Create directory if it doesn't exist
        await fs.ensureDir(projectPath);

        let result = {
            success: true,
            message: 'Project setup completed',
            steps: []
        };

        // Install dependencies if provided
        if (dependencies && dependencies.length > 0) {
            const depResult = await installDependencies(projectPath, dependencies);
            result.steps.push({
                step: 'install_dependencies',
                result: depResult
            });
            
            if (!depResult.success) {
                result.success = false;
                result.message = 'Project setup failed during dependency installation';
            }
        }

        // Run commands if provided
        if (commands && commands.length > 0) {
            const cmdResult = await runCommands(projectPath, commands);
            result.steps.push({
                step: 'run_commands',
                result: cmdResult
            });
            
            if (!cmdResult.success) {
                result.success = false;
                result.message = 'Project setup failed during command execution';
            }
        }

        return result;

    } catch (error) {
        return {
            success: false,
            error: error.message,
            message: 'Project setup failed'
        };
    }
}

async function createDirectory(projectPath) {
    try {
        await fs.ensureDir(projectPath);
        
        return {
            success: true,
            message: 'Directory created successfully',
            path: projectPath,
            exists: await fs.pathExists(projectPath)
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            message: 'Failed to create directory'
        };
    }
}
