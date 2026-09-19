import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { afterAll, describe, expect, it } from 'vitest';

import { addBuiltinRequireMap, buildPlaywrightWorker, inlinePackageMetadata } from '../scripts/workflow/build-playwright-worker';

const exec = promisify(execFile);
let outputDir: string | undefined;

afterAll(async () => {
    if (outputDir) {
        await rm(outputDir, { recursive: true, force: true });
    }
});

describe('Playwright Worker client build', () => {
    it('keeps the native module namespace out of the Worker shim dependency cycle', () => {
        const input = 'import { createRequire } from "node:module";\nvar __require = /* #__PURE__ */ (() => createRequire(import.meta.url))();\nrequire("node:module"); require("process");';
        const result = addBuiltinRequireMap(input);
        expect(result.source).not.toContain('createRequire');
        expect(result.source).toContain('var __require = (...args) => require(...args);');
        expect(result.source).toContain('import * as builtin0 from "module";');
        expect(result.source).not.toContain('from "node:module"');
        expect(result.source).toContain('"node:module": (builtin0.default ?? builtin0)');
        expect(() => addBuiltinRequireMap('require("node:module");')).toThrow('exactly one createRequire import');
    });

    it('fails visibly when a dependency update changes or duplicates a metadata require', () => {
        const packageSource = 'require(import_path8.default.join(packageRoot, "package.json"))';
        const browsersSource = 'require(import_path19.default.join(packageRoot, "browsers.json"))';
        const metadata = { 'package.json': { version: '1.62.2', description: '$&' }, 'browsers.json': { browsers: [] } };

        expect(inlinePackageMetadata(`${packageSource};${browsersSource}`, metadata)).toBe(`${JSON.stringify(metadata['package.json'])};${JSON.stringify(metadata['browsers.json'])}`);
        expect(() => inlinePackageMetadata(packageSource, metadata)).toThrow('exactly one metadata require: browsers.json');
        expect(() => inlinePackageMetadata(`${packageSource};${packageSource};${browsersSource}`, metadata)).toThrow('exactly one metadata require: package.json');
    });

    it('builds the installed protocol client without initializing it before the first request', async () => {
        outputDir = await mkdtemp(path.join(os.tmpdir(), 'rsshub-playwright-build-'));
        const result = await buildPlaywrightWorker(outputDir);
        const moduleUrl = pathToFileURL(path.join(outputDir, 'playwright-worker.mjs')).href;
        const script = `
            import assert from 'node:assert/strict';
            const NativeAbortController = globalThis.AbortController;
            globalThis.AbortController = class {
                constructor() { throw new Error('Protocol initialized outside the request'); }
            };
            globalThis.fetch = () => { throw new Error('Build smoke must not access the network'); };
            const { getPlaywrightCore } = await import(${JSON.stringify(moduleUrl)});
            globalThis.AbortController = NativeAbortController;
            const first = await getPlaywrightCore();
            const second = await getPlaywrightCore();
            assert.equal(first, second);
            assert.equal(first.getPlaywrightVersion(), ${JSON.stringify(result.version)});
            assert.equal(typeof first.inprocess.playwright.chromium.connect, 'function');
            assert.equal(typeof first.server.WebSocketTransport.connect, 'function');
            process.stdout.write('lazy-client-ready');
        `;
        const { stdout } = await exec(process.execPath, ['--input-type=module', '-e', script], { timeout: 20000 });
        expect(stdout).toBe('lazy-client-ready');
        expect(result.builtins).toContain('process');
        const bundleSource = await readFile(path.join(outputDir, 'playwright-worker.mjs'), 'utf8');
        expect(bundleSource).not.toContain('createRequire(import.meta.url)');
        const manifest = JSON.parse(await readFile(path.join(outputDir, 'playwright-worker.json'), 'utf8'));
        expect(manifest.version).toBe(result.version);
    }, 30000);
});
