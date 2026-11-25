/* oxlint-disable unicorn/prefer-code-point */
import { inflateSync } from 'node:zlib';

const unzip = (b64Data) => {
    const binData = Buffer.from(b64Data, 'base64');
    const data = inflateSync(binData);
    let ret = '';
    for (const c of data) {
        ret += String.fromCharCode(c);
    }
    return ret;
};

export { unzip };
