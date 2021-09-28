/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path';
import { nodeFileTrace } from '@vercel/nft';
const files = ['lib/index.js', 'api/now.js'];
const resultFolder = 'app-minimal';

(async () => {
    console.log('Start analyizing...');
    const { fileList } = await nodeFileTrace(files, {
        base: path.resolve(path.join(__dirname, '../..')),
    });
    console.log('Total files need to be copy: ' + fileList.length);
    return Promise.all(fileList.map((e) => fs.copy(e, path.resolve(path.join(resultFolder, e)))));
})();
