const pako = require('pako');

module.exports = function unzip(b64Data) {
    const strData = atob(b64Data);
    const charData = strData.split('').map((x) => x.charCodeAt(0));
    const binData = new Uint8Array(charData);
    const data = pako.inflate(binData);
    let ret = '';
    for (let i = 0; i < data.length; i++) {
        ret += String.fromCharCode(data[i]);
    }
    return ret;
};
