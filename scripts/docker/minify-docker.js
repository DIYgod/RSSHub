/* eslint-disable no-console */
const fs = require('fs-extra');
const path = require('path');
const { nodeFileTrace } = require('@vercel/nft');
const files = ['lib/index.js', 'api/now.js'];
const resultFolder = 'app-minimal';

(async () => {
    console.log('Start analyizing...');
    const { fileList: fileSet } = await nodeFileTrace(files, {
        base: path.resolve(path.join(__dirname, '../..')),
    });
    let fileList = Array.from(fileSet);
    console.log('Total touchable files:', fileList.length);
    fileList = fileList.filter((file) => file.startsWith('node_modules/')); // only need node_modules
    console.log('Total files need to be copied (touchable files in node_modules/): ', fileList.length);
    return Promise.all(fileList.map((e) => fs.copy(e, path.resolve(path.join(resultFolder, e)))));
})();
