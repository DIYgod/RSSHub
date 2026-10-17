import fs from 'node:fs';
import path from 'node:path';

import type { KnipConfig } from 'knip';

// Route modules are loaded by directory import (see lib/registry-dev.ts and scripts/workflow/build-routes.ts),
// so only files exporting `route`, `namespace` or `apiRoute` are real entries; everything else must be imported.
const routeEntryPattern = /^export (?:const|\{) ?(?:route|namespace|apiRoute)\b/m;

const routeEntries = fs
    .readdirSync('lib/routes', { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name).replaceAll('\\', '/'))
    .filter((file) => routeEntryPattern.test(fs.readFileSync(file, 'utf8')));

const config: KnipConfig = {
    entry: [
        // A trailing `!` marks production code for `knip --production`
        ...routeEntries.map((file) => `${file}!`),
        'lib/routes/*.{ts,tsx}!',
        // Swapped in for their non-worker counterparts by workerAliasPlugin and `alias` in tsdown-worker.config.ts
        'lib/**/*.worker.{ts,tsx}!',
        'lib/shims/*.ts!',
        // Disabled Twitter login flows kept for re-enabling, see the commented-out imports in
        // lib/routes/twitter/api/index.ts, mobile-api/token.ts and web-api/utils.ts
        'lib/routes/twitter/api/{mobile-api/api,mobile-api/login,web-api/login}.ts',
        // Imported by actions/github-script steps in .github/workflows
        'scripts/workflow/test-issue/{call-maintainer,check-issue}.mjs',
        'scripts/workflow/test-route/{identify,test}.mjs',
        // Copied into the image and run by the Dockerfile
        'scripts/docker/minify-docker.js',
    ],
    project: ['lib/**/*.{ts,tsx}!', 'scripts/**/*.{ts,js,mjs}'],
    // Also report unused exports of entry files; scripts/knip-preprocessor.ts drops the ones the route registry reads
    includeEntryExports: true,
    preprocessor: './scripts/knip-preprocessor.ts',
    ignoreIssues: {
        // Mirror the API of the module they replace in the worker build
        'lib/shims/*.ts': ['exports'],
        'lib/**/*.worker.{ts,tsx}': ['exports', 'types'],
        // Consumed by npm package users and Cloudflare (Durable Object / container classes)
        'lib/pkg.ts': ['exports'],
        'lib/worker.ts': ['exports'],
        'lib/container.ts': ['exports'],
        'scripts/workflow/test-{issue,route}/*.mjs': ['exports'],
        'lib/routes/twitter/api/{mobile-api/api,mobile-api/login,web-api/login}.ts': ['exports'],
    },
    ignoreDependencies: [
        // `cloudflare:test` virtual module provided by @cloudflare/vitest-plugin
        'cloudflare',
    ],
    // `cycles` is opt-in, and listing it here replaces the default issue types, so those are repeated
    include: ['files', 'dependencies', 'unlisted', 'binaries', 'unresolved', 'exports', 'types', 'enumMembers', 'namespaceMembers', 'duplicates', 'catalog', 'catalogReferences', 'cycles'],
    rules: {
        cycles: 'error',
    },
    treatConfigHintsAsErrors: true,
};

export default config;
