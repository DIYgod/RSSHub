// @ts-nocheck
const { inflateSync } = require('zlib');

const unzip = (b64Data) => {
    const strData = Buffer.from(b64Data, 'base64').toString('binary');
    const charData = [...strData].map((x) => x.charCodeAt(0));
    const binData = new Uint8Array(charData);
    const data = inflateSync(binData);
    let ret = '';
    for (const c of data) {
        ret += String.fromCharCode(c);
    }
    return ret;
};

module.exports = {
    unzip,
};
