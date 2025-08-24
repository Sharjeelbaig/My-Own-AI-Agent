// const vm = require('vm');

import vm from 'vm';
/**
 * executeJS.js
 *
 * Exports an async function `executeJS(code, options)` that runs arbitrary JS code
 * inside a restricted vm sandbox, captures console.log output, supports async/await,
 * and enforces a timeout.
 *
 * Usage:
 *   const executeJS = require('./executeJS');
 *   const { result, logs } = await executeJS('console.log("hi"); return 2+2;', { timeout: 500 });
 */


export async function executeJS(code, options = {}) {
    const { timeout = 1000, context = {} } = options;

    // Capture console output
    const logs = [];
    const sandboxConsole = {
        log: (...args) => logs.push(args.map(arg => safeStringify(arg)).join(' ')),
        info: (...args) => logs.push(args.map(arg => safeStringify(arg)).join(' ')),
        warn: (...args) => logs.push(args.map(arg => safeStringify(arg)).join(' ')),
        error: (...args) => logs.push(args.map(arg => safeStringify(arg)).join(' ')),
    };

    // Build sandbox with minimal globals (no require/process)
    const sandbox = Object.assign(
        {
            console: sandboxConsole,
            // allow async timer functions inside the sandbox
            setTimeout,
            setInterval,
            clearTimeout,
            clearInterval,
            // common globals
            Promise,
            Date,
            Math,
            String,
            Number,
            Boolean,
            Array,
            Object,
            JSON,
            // an empty module-like object if code expects it
            module: {},
            exports: {},
        },
        context
    );

    const vmContext = vm.createContext(sandbox);

    // Wrap code to allow top-level await and to return a value
    const wrapped = `(async () => {\ntry {\n${code}\n} finally {\n}\n})()`;

    let script;
    try {
        script = new vm.Script(wrapped, { filename: 'executeJS.vm.js' });
    } catch (err) {
        // Syntax error during compilation
        throw err;
    }

    // Run and enforce timeout for the returned Promise
    try {
        const resultPromise = script.runInContext(vmContext);

        const result = await promiseWithTimeout(resultPromise, timeout);

        return { result: safeStringify(result), logs };
    } catch (err) {
        // Propagate errors with logs included for easier debugging
        const error = new Error(err && err.message ? err.message : String(err));
        error.original = err;
        error.logs = logs;
        throw error;
    }
}

function promiseWithTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
        let settled = false;
        const t = setTimeout(() => {
            if (settled) return;
            settled = true;
            reject(new Error('Execution timed out'));
        }, ms);

        Promise.resolve(promise)
            .then((v) => {
                if (settled) return;
                settled = true;
                clearTimeout(t);
                resolve(v);
            })
            .catch((err) => {
                if (settled) return;
                settled = true;
                clearTimeout(t);
                reject(err);
            });
    });
}

function safeStringify(value) {
    try {
        // primitives and JSON-able objects
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean') return String(value);
        return JSON.stringify(value);
    } catch (_) {
        try {
            return String(value);
        } catch (__) {
            return '[Unserializable value]';
        }
    }
}
