const { decompressFromBase64 } = require('lz-string');
const { resolve } = require('url');
const cheerio = require('cheerio');
const axios = require('../../utils/axios');

exports.getDetail = async (chapterInfo) => {
    const { data } = await axios.get(chapterInfo.link);
    const $ = cheerio.load(data);

    const dataScript = $('script:not([src])').html();
    const {
        files,
        path,
        cid,
        sl: { md5 },
    } = decryptChapterData(dataScript);
    const genPicUrl = (filename) => resolve('https://i.hamreus.com/', `${path}${filename}?cid=${cid}&md5=${md5}`);
    const picUrls = files.map(genPicUrl);
    console.log(picUrls);
    return {};
};

const decryptChapterData = (script) => {
    const encryptedDataStr = script
        .slice(349, -3)
        .replace("['\\x73\\x70\\x6c\\x69\\x63']('\\x7c')", '')
        .replace(/"/g, '\\"')
        .replace(/'/g, '"');
    const encryptedData = JSON.parse(`[${encryptedDataStr}]`);
    encryptedData[3] = decompressFromBase64(encryptedData[3]).split('|');
    const decryptedCode = unpack(...encryptedData);
    const chapterDataStr = decryptedCode.slice(12, -12);
    return JSON.parse(chapterDataStr);
};

// codes from packjs
const unpack = function(p, a, c, k, e, d) {
    e = function(c) {
        return (c < a ? '' : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
    };
    while (c--) {
        d[e(c)] = k[c] || e(c);
    }
    k = [
        function(e) {
            return d[e];
        },
    ];
    e = function() {
        return '\\w+';
    };
    c = 1;
    while (c--) {
        if (k[c]) {
            p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
        }
    }
    return p;
};
