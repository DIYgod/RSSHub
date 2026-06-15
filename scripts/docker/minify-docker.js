/* eslint-disable no-console */
import path from 'node:path';

import { nodeFileTrace } from '@vercel/nft';
import fs from 'fs-extra';

const __dirname = import.meta.dirname;
// !!! if any new dependencies are added, update the Dockerfile !!!

const projectRoot = path.resolve(process.env.PROJECT_ROOT || path.join(__dirname, '../..'));
const resultFolder = path.join(projectRoot, 'app-minimal'); // no need to resolve, ProjectRoot is always absolute
const files = ['dist/index.mjs', 'node_modules/cross-env/dist/bin/cross-env.js', 'node_modules/.bin/cross-env'].map((file) => path.join(projectRoot, file));

console.log('Start analyzing, project root:', projectRoot);
const { fileList: fileSet } = await nodeFileTrace(files, {
    base: projectRoot,
});
let fileList = [...fileSet];
console.log('Total touchable files:', fileList.length);
fileList = fileList.filter((file) => file.startsWith('node_modules/')); // only need node_modules

// playwright-core uses path.join to load browsers.json in v1.60+ instead of ../.., which prevents @vercel/nft from tracing it.
// https://github.com/microsoft/playwright/blob/v1.60.0/packages/playwright-core/src/server/registry/index.ts#L1544 vs
// https://github.com/microsoft/playwright/blob/v1.59.1/packages/playwright-core/src/server/registry/index.ts#L1520
// also, nft's special case for `playwright-core` no longer works for `patchright-core` https://github.com/vercel/nft/blob/1.10.2/src/utils/special-cases.ts#L336
const patchrightCoreFile = fileList.find((file) => file.includes('/patchright-core/'));
if (patchrightCoreFile) {
    const packageRoot = patchrightCoreFile.slice(0, patchrightCoreFile.indexOf('/patchright-core/') + '/patchright-core'.length);
    const browsersJson = `${packageRoot}/browsers.json`;
    if (!fileList.includes(browsersJson) && (await fs.pathExists(path.join(projectRoot, browsersJson)))) {
        fileList.push(browsersJson);
        console.log('Manually included patchright-core asset:', browsersJson);
    }
}
console.log('Total files need to be copied (touchable files in node_modules/):', fileList.length);
console.log('Start copying files, destination:', resultFolder);
await Promise.all(fileList.map((e) => fs.copy(path.join(projectRoot, e), path.join(resultFolder, e)))).catch((error) => {
    // fix unhandled promise rejections
    console.error(error, error.stack);
    process.exit(1);
});
