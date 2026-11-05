import type { ChildProcess } from 'node:child_process';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Readable } from 'node:stream';

import { parse } from 'dotenv';

export interface InstanceOptions {
    /** The RSSHub server entry to run (dist-lib/magpie-server.mjs) */
    serverFile: string;
    /** Where the server runs: its working directory, which may hold a `.env` file */
    dataDir: string;
    port: number;
    /** Environment variables from the plugin's options, over the `.env` file */
    env: Record<string, string>;
    log: (message: string) => void;
}

export interface Instance {
    /** The address the plugin reaches the server at */
    readonly origin: string;
    /** The environment the server runs with */
    readonly env: Record<string, string>;
    /** A path and query on the server as the plugin asks for it: with the access key when the server has one */
    url: (pathAndQuery: string) => string;
    /** Resolves once the server answers, rejects with why it doesn't */
    ready: (signal?: AbortSignal) => Promise<void>;
}

// What RSSHub runs with unless `.env` or the options say otherwise: this computer only, logs
// in magpie's log rather than in files, and only the lines that need a look.
const defaults: Record<string, string> = {
    LISTEN_INADDR_ANY: '0',
    NO_LOGFILES: 'true',
    LOGGER_LEVEL: 'warn',
};

const RECENT_LINES = 30;
const MAX_FAILURES = 5;
const READY_TIMEOUT = 30000;
const START_DELAY = 2000;
// eslint-disable-next-line no-control-regex
const ansi = /\u{1B}\[[\d;]*m/gu;

const sleep = (ms: number, signal?: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        signal?.addEventListener(
            'abort',
            () => {
                clearTimeout(timer);
                reject(signal.reason);
            },
            { once: true }
        );
    });

const readDotenv = (dataDir: string) => {
    try {
        return parse(readFileSync(path.join(dataDir, '.env')));
    } catch {
        return {};
    }
};

const answers = async (url: string) => {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
        return response.ok;
    } catch {
        return false;
    }
};

export const startInstance = (options: InstanceOptions): Instance => {
    mkdirSync(options.dataDir, { recursive: true });

    const env: Record<string, string> = {
        ...defaults,
        ...readDotenv(options.dataDir),
        ...options.env,
        NODE_ENV: 'production',
        PORT: String(options.port),
    };
    const origin = `http://127.0.0.1:${options.port}`;
    // every path but the home page asks for ACCESS_KEY when it is set (lib/middleware/access-control.ts)
    const url = (pathAndQuery: string) => {
        const target = new URL(pathAndQuery, origin);
        if (env.ACCESS_KEY) {
            target.searchParams.set('key', env.ACCESS_KEY);
        }
        return target.href;
    };
    const recent: string[] = [];
    let child: ChildProcess | undefined;
    let failures = 0;
    let gaveUp = false;
    let startedAt = 0;

    const remember = (line: string) => {
        const text = line.replaceAll(ansi, '').trimEnd();
        if (!text) {
            return;
        }
        recent.push(text);
        if (recent.length > RECENT_LINES) {
            recent.shift();
        }
        options.log(text);
    };

    const pipeLines = (stream: Readable | null) => {
        let rest = '';
        stream?.setEncoding('utf8');
        stream?.on('data', (chunk: string) => {
            const lines = (rest + chunk).split('\n');
            rest = lines.pop() ?? '';
            for (const line of lines) {
                remember(line);
            }
        });
        stream?.on('end', () => remember(rest));
    };

    const run = () => {
        startedAt = Date.now();
        child = spawn(process.execPath, [options.serverFile], {
            cwd: options.dataDir,
            env: { ...process.env, ...env, RSSHUB_MAGPIE_HOST: '1' },
            // stdin stays open and unwritten: the server ends itself when it closes, with the host
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true,
        });
        pipeLines(child.stdout);
        pipeLines(child.stderr);
        child.on('error', (error) => remember(`could not start RSSHub: ${error.message}`));
        child.on('exit', (code, signal) => {
            child = undefined;
            remember(`RSSHub exited (${signal ?? `code ${code}`})`);
            // a server that ran a while had a failure of its own, not one at start
            failures = Date.now() - startedAt > 60000 ? 1 : failures + 1;
            if (failures >= MAX_FAILURES) {
                gaveUp = true;
                return;
            }
            // a port still held by the server of the host before this one is let go in a moment
            setTimeout(run, Math.min(30000, 500 * 2 ** failures)).unref();
        });
    };

    const waitFor = async (deadline: number, signal?: AbortSignal): Promise<void> => {
        if (await answers(url('/healthz'))) {
            return;
        }
        if (gaveUp || Date.now() > deadline) {
            const why = recent.slice(-8).join('\n');
            throw new Error(`RSSHub isn't answering at ${origin}.${why ? `\nIts last log lines:\n${why}` : ''}`);
        }
        await sleep(300, signal);
        return waitFor(deadline, signal);
    };

    // Each magpie command in a terminal loads the plugins in a host of its own that ends a moment
    // later: the server starts a little after the plugin loads, so those hosts don't run one each.
    const start = setTimeout(run, START_DELAY);

    const ready = (signal?: AbortSignal) => {
        if (startedAt === 0) {
            clearTimeout(start);
            run();
        } else if (gaveUp && !child) {
            // asked again after it gave up: one more round of tries
            gaveUp = false;
            failures = 0;
            run();
        }
        return waitFor(Date.now() + READY_TIMEOUT, signal);
    };

    return { origin, env, url, ready };
};
