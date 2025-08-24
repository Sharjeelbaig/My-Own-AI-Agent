// using exec, it executes a command in a shell for purpose like creating project directories or deleting them, saving images, or running safe scripts.
// What I mean by "safe scripts" is that the commands executed should not harm the system or compromise security.

import { exec } from "child_process";

export const bashExecute = async (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Stderr: ${stderr}`);
                return;
            }
            resolve(stdout);
        });
    });
};