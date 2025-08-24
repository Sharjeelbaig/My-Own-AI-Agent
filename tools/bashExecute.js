export async function bashExecute(query) {
    const q = String(query || '').trim();
    if (!q) throw new Error('Empty query');
    const { exec } = await import('child_process');
    return await new Promise((resolve, reject) => {
        exec(q, { shell: '/bin/bash', maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
            if (err) {
                err.stdout = stdout;
                err.stderr = stderr;
                return reject(err);
            }
            resolve({ stdout: String(stdout), stderr: String(stderr) });
        });
    });
}