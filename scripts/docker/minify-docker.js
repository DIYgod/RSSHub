/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'node:path';
import { nodeFileTrace } from '@vercel/nft';
const __dirname = import.meta.dirname;
// !!! if any new dependencies are added, update the Dockerfile !!!

const projectRoot = path.resolve(process.env.PROJECT_ROOT || path.join(__dirname, '../..'));
const resultFolder = path.join(projectRoot, 'app-minimal'); // no need to resolve, ProjectRoot is always absolute
const files = ['dist/index.js', 'node_modules/cross-env/dist/bin/cross-env.js', 'node_modules/.bin/cross-env'].map((file) => path.join(projectRoot, file));

console.log('Start analyzing, project root:', projectRoot);
const { fileList: fileSet } = await nodeFileTrace(files, {
    base: projectRoot,
});
let fileList = [...fileSet];
console.log('Total touchable files:', fileList.length);
fileList = fileList.filter((file) => file.startsWith('node_modules/')); // only need node_modules
console.log('Total files need to be copied (touchable files in node_modules/):', fileList.length);
console.log('Start copying files, destination:', resultFolder);
await Promise.all(fileList.map((e) => fs.copy(path.join(projectRoot, e), path.join(resultFolder, e)))).catch((error) => {
    // fix unhandled promise rejections
    console.error(error, error.stack);
    process.exit(1);
});
