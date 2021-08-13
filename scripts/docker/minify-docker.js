/* eslint-disable no-console */
const fs = require('fs-extra');
const path = require('path');
const { nodeFileTrace } = require('@vercel/nft');
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
