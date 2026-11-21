import path from 'node:path';

import type { Preprocessor } from 'knip';

// Exports read by the route registry through directory import, which knip cannot trace.
const registryExports = new Set(['route', 'namespace', 'apiRoute']);

const preprocessor: Preprocessor = (options) => {
    const records = options.issues.exports;
    for (const [file, issues] of Object.entries(records)) {
        if (!path.relative(options.cwd, file).replaceAll('\\', '/').startsWith('lib/routes/')) {
            continue;
        }
        for (const name of Object.keys(issues)) {
            if (!registryExports.has(name)) {
                continue;
            }
            delete issues[name];
            options.counters.exports--;
        }
        if (Object.keys(issues).length === 0) {
            delete records[file];
        }
    }
    return options;
};

export default preprocessor;
