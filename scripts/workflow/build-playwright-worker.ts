import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { builtinModules, createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { rolldown } from 'rolldown';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const packageRequire = createRequire(new URL('../../package.json', import.meta.url));
const patchrightRequire = createRequire(packageRequire.resolve('patchright'));
const corePath = patchrightRequire.resolve('patchright-core/lib/coreBundle');
const packageDir = path.dirname(path.dirname(corePath));
const builtinNames = new Set(builtinModules.map((name) => name.replace(/^node:/, '')));

const workerEntryId = '\0virtual:playwright-worker-entry.mjs';

type Metadata = Record<'package.json' | 'browsers.json', unknown>;

export function inlinePackageMetadata(source: string, metadata: Metadata) {
    const expressions = {
        'package.json': /require\(import_path\d*\.default\.join\(packageRoot, "package\.json"\)\)/g,
        'browsers.json': /require\(import_path\d*\.default\.join\(packageRoot, "browsers\.json"\)\)/g,
    };
    for (const filename of Object.keys(expressions) as Array<keyof Metadata>) {
        const expression = expressions[filename];
        if (source.matchAll(expression).toArray().length !== 1) {
            throw new Error(`Patchright Worker build expected exactly one metadata require: ${filename}`);
        }
        source = source.replace(expression, () => JSON.stringify(metadata[filename]));
    }
    return source;
}

export function addBuiltinRequireMap(source: string) {
    const importLine = 'import { createRequire } from "node:module";\n';
    if (source.split(importLine).length - 1 !== 1) {
        throw new Error('Playwright Worker build expected exactly one createRequire import');
    }
    source = source.replace(importLine, '');
    const helperPattern = /^var __require = .*createRequire\(import\.meta\.url\).*;$/gm;
    if (source.matchAll(helperPattern).toArray().length !== 1) {
        throw new Error('Playwright Worker build expected exactly one createRequire runtime helper');
    }
    source = source.replace(helperPattern, 'var __require = (...args) => require(...args);');
    const usedBuiltins = [
        ...new Set(
            source
                .matchAll(/(?:__require|require)\(["']([^"'\n]+)["']\)/g)
                .toArray()
                .map((match) => match[1].replace(/^node:/, ''))
                .filter((name) => builtinNames.has(name))
        ),
    ].sort((left, right) => left.localeCompare(right));
    // Avoid the project's node:module shim here: its namespace export creates a Rolldown runtime cycle.
    const imports = usedBuiltins.map((name, index) => `import * as builtin${index} from ${JSON.stringify(name === 'module' ? 'module' : `node:${name}`)};`);
    const entries = usedBuiltins.flatMap((name, index) => [name, `node:${name}`].map((alias) => `${JSON.stringify(alias)}: (builtin${index}.default ?? builtin${index})`));
    // Workers cannot dynamically require every supported Node builtin. Static imports
    // also keep the optional Node-only paths from escaping this module's require map.
    const requireMap = `const builtinMap = Object.freeze({${entries.join(',')}});
const require = (id) => {
    if (Object.hasOwn(builtinMap, id)) return builtinMap[id];
    throw new Error('Playwright module is unavailable in Workers: ' + id);
};`;
    return { source: `${imports.join('\n')}\n${requireMap}\n${source}`, usedBuiltins };
}

export async function buildPlaywrightWorker(outputDir = path.join(repoRoot, 'assets/build')) {
    const [packageJson, browsersJson, coreSource] = await Promise.all([readFile(path.join(packageDir, 'package.json'), 'utf8'), readFile(path.join(packageDir, 'browsers.json'), 'utf8'), readFile(corePath, 'utf8')]);
    const packageMetadata = JSON.parse(packageJson);
    if (packageMetadata.name !== 'patchright-core') {
        throw new Error('Playwright Worker build must use the installed patchright-core package');
    }
    const source = inlinePackageMetadata(coreSource, {
        'package.json': packageMetadata,
        'browsers.json': JSON.parse(browsersJson),
    });
    const bundle = await rolldown({
        input: workerEntryId,
        platform: 'node',
        treeshake: false,
        // Remote Chromium needs neither the local BiDi mapper nor macOS file watching.
        // A runtime call to an unbundled optional module fails through the require map.
        external: (id) => id === 'fsevents' || id.startsWith('chromium-bidi/'),
        transform: {
            define: {
                __dirname: JSON.stringify('/bundle/lib'),
                __filename: JSON.stringify('/bundle/lib/coreBundle.js'),
            },
        },
        logLevel: 'silent',
        plugins: [
            {
                name: 'playwright-worker-metadata',
                resolveId(id) {
                    if (id === workerEntryId || id === 'rsshub-playwright-core') {
                        return id === workerEntryId ? workerEntryId : corePath;
                    }
                    return null;
                },
                load(id) {
                    if (id === workerEntryId) {
                        // Patchright initializes AbortController and other request-scoped state.
                        // Keep its first import inside the caller's Worker request handler.
                        return `let corePromise;
export function getPlaywrightCore() {
    return corePromise ??= import('rsshub-playwright-core').then((module) => module.default ?? module);
}`;
                    }
                    if (id === corePath) {
                        return source;
                    }
                    return null;
                },
            },
        ],
    });
    const { output } = await bundle.generate({ format: 'esm', codeSplitting: false });
    const generated = addBuiltinRequireMap(output[0].code);
    await mkdir(outputDir, { recursive: true });
    await Promise.all([
        writeFile(path.join(outputDir, 'playwright-worker.mjs'), generated.source),
        writeFile(path.join(outputDir, 'playwright-worker.json'), JSON.stringify({ version: packageMetadata.version, builtins: generated.usedBuiltins }, null, 2) + '\n'),
    ]);
    await bundle.close();
    return { version: packageMetadata.version, bytes: Buffer.byteLength(generated.source), builtins: generated.usedBuiltins };
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
    const result = await buildPlaywrightWorker();
    process.stdout.write(`Built Playwright ${result.version} Worker client (${result.bytes} bytes)\n`);
}
