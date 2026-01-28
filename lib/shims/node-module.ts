// Shim for node:module in Cloudflare Workers
// Provides a createRequire that returns pre-imported modules

import * as assert from 'node:assert';
import * as async_hooks from 'node:async_hooks';
import * as buffer from 'node:buffer';
import * as console_module from 'node:console';
import * as constants from 'node:constants';
import * as crypto from 'node:crypto';
import * as diagnostics_channel from 'node:diagnostics_channel';
import * as dns from 'node:dns';
// For events, we need the default export (EventEmitter class) for CJS compatibility
// CJS require('events') returns EventEmitter class directly
import events, * as eventsNamespace from 'node:events';
// Pre-import Node.js builtins that CJS modules might require
import * as fs from 'node:fs';
import * as fs_promises from 'node:fs/promises';
import * as http from 'node:http';
import * as https from 'node:https';
import * as net from 'node:net';
import * as os from 'node:os';
import path from 'node:path';
import * as perf_hooks from 'node:perf_hooks';
import * as process from 'node:process';
import * as punycode from 'node:punycode';
import * as querystring from 'node:querystring';
import * as readline from 'node:readline';
import * as stream from 'node:stream';
import * as stream_promises from 'node:stream/promises';
import * as stream_web from 'node:stream/web';
import * as string_decoder from 'node:string_decoder';
import * as timers from 'node:timers';
import * as timers_promises from 'node:timers/promises';
import * as tls from 'node:tls';
import * as tty from 'node:tty';
import * as url from 'node:url';
// eslint-disable-next-line unicorn/import-style -- need full util module for CJS compatibility
import * as util from 'node:util';
import * as util_types from 'node:util/types';
import * as worker_threads from 'node:worker_threads';
import * as zlib from 'node:zlib';

// VM shim for Cloudflare Workers
// JSDOM and some other libraries require vm module
class ScriptShim {
    private code: string;
    constructor(code: string) {
        this.code = code;
    }
    runInContext() {
        throw new Error('vm.Script.runInContext is not supported in Workers');
    }
    runInNewContext() {
        throw new Error('vm.Script.runInNewContext is not supported in Workers');
    }
    runInThisContext() {
        throw new Error('vm.Script.runInThisContext is not supported in Workers');
    }
}

const vmShim = {
    createContext: (sandbox?: object) => sandbox || {},
    runInContext: () => {
        throw new Error('vm.runInContext is not supported in Workers');
    },
    runInNewContext: () => {
        throw new Error('vm.runInNewContext is not supported in Workers');
    },
    runInThisContext: () => {
        throw new Error('vm.runInThisContext is not supported in Workers');
    },
    Script: ScriptShim,
    isContext: () => false,
    compileFunction: () => {
        throw new Error('vm.compileFunction is not supported in Workers');
    },
};

// Child process shim (inline to avoid import cycle)
const child_process = {
    execSync: (_command: string): Buffer => Buffer.from(''),
    exec: () => {
        throw new Error('exec is not supported in Cloudflare Workers');
    },
    spawn: () => {
        throw new Error('spawn is not supported in Cloudflare Workers');
    },
    fork: () => {
        throw new Error('fork is not supported in Cloudflare Workers');
    },
    execFile: () => {
        throw new Error('execFile is not supported in Cloudflare Workers');
    },
    execFileSync: () => {
        throw new Error('execFileSync is not supported in Cloudflare Workers');
    },
    spawnSync: () => {
        throw new Error('spawnSync is not supported in Cloudflare Workers');
    },
};

// Create a CJS-compatible events module
// In CJS, require('events') returns EventEmitter class directly (the default export)
// but also has named exports attached to it
const eventsModule = Object.assign(events, eventsNamespace);

// Map of module names to their exports
const builtinModules: Record<string, unknown> = {
    fs,
    path,

    util,
    stream,
    events: eventsModule,
    buffer,
    crypto,
    http,
    https,
    url,
    querystring,
    zlib,
    os,
    assert,
    tty,
    net,
    dns,
    child_process,
    string_decoder,
    timers,
    process,
    perf_hooks,
    async_hooks,
    worker_threads,
    tls,
    readline,

    punycode,

    constants,
    diagnostics_channel,
    console: console_module,
    vm: vmShim,
    // Also support node: prefix
    'node:fs': fs,
    'node:path': path,
    'node:util': util,
    'node:stream': stream,
    'node:events': eventsModule,
    'node:buffer': buffer,
    'node:crypto': crypto,
    'node:http': http,
    'node:https': https,
    'node:url': url,
    'node:querystring': querystring,
    'node:zlib': zlib,
    'node:os': os,
    'node:assert': assert,
    'node:tty': tty,
    'node:net': net,
    'node:dns': dns,
    'node:child_process': child_process,
    'node:string_decoder': string_decoder,
    'node:timers': timers,
    'node:process': process,
    'node:perf_hooks': perf_hooks,
    'node:async_hooks': async_hooks,
    'node:worker_threads': worker_threads,
    'node:tls': tls,
    'node:readline': readline,
    'node:punycode': punycode,
    'node:constants': constants,
    'node:diagnostics_channel': diagnostics_channel,
    'node:console': console_module,
    'node:fs/promises': fs_promises,
    'fs/promises': fs_promises,
    'node:stream/promises': stream_promises,
    'stream/promises': stream_promises,
    'node:stream/web': stream_web,
    'stream/web': stream_web,
    'node:util/types': util_types,
    'util/types': util_types,
    'node:timers/promises': timers_promises,
    'timers/promises': timers_promises,
    'node:vm': vmShim,
};

export function createRequire(_filename: string | URL) {
    return function require(id: string): unknown {
        if (id in builtinModules) {
            return builtinModules[id];
        }
        // For non-builtin modules, throw an error
        throw new Error(`require() is not available in Workers. Attempted to require: ${id}`);
    };
}

export default {
    createRequire,
};
