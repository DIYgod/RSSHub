import { type ChildProcess, fork } from 'node:child_process';
import { once } from 'node:events';

const PARSE_TIMEOUT = 10000;

let child: ChildProcess | undefined;
let exited: AbortController;
let queue = Promise.resolve();

const stop = () => {
    child?.kill('SIGKILL');
    child = undefined;
};

const run = async (link: string, html: string) => {
    if (!child || exited.signal.aborted) {
        // imported dynamically so that bundlers emit it as a file of its own
        const { filename } = await import('./mercury-child');
        const controller = new AbortController();
        exited = controller;
        child = fork(filename, {
            // the child kills itself well before it reaches this
            execArgv: ['--max-old-space-size=1024'],
            stdio: ['ignore', 'ignore', 'inherit', 'ipc'],
        });
        child.on('error', () => {});
        child.once('exit', () => controller.abort());
    }
    try {
        child.send({ link, html });
        const [{ result }] = await once(child, 'message', {
            signal: AbortSignal.any([AbortSignal.timeout(PARSE_TIMEOUT), exited.signal]),
        });
        return result;
    } catch (error) {
        stop();
        throw error;
    }
};

/**
 * Mercury is synchronous, and the time and memory it takes grow faster than the size of the page, which a third party chooses.
 * So pages are parsed one at a time in a child process, which is killed once it exceeds its time or memory limit.
 */
export const parse = async (link: string, html: string) => {
    const previous = queue;
    const { promise, resolve } = Promise.withResolvers<void>();
    queue = promise;
    await previous;
    try {
        return await run(link, html);
    } finally {
        // no more pages are waiting
        if (queue === promise) {
            stop();
        }
        resolve();
    }
};
