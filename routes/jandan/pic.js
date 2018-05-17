const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const config = require('../../config');

const md5 = (i) =>
    crypto
        .createHash('md5')
        .update(i)
        .digest()
        .toString('hex');

const base64_decode = (i) => new Buffer(i, 'base64').toString('binary');

const chr = (i) => String.fromCharCode(i);

const ord = (i) => i.charCodeAt();

const time = () => parseInt(new Date().getTime() / 1000);

// jandan_magic will load a magic string from jandan's script, which will be used in jandan_decode.
const jandan_magic = async (url) => {
    const script = await axios({
        method: 'get',
        url: 'http:' + url,
        headers: {
            'User-Agent': config.ua,
            Referer: 'http://jandan.net',
        },
    });
    const regex = /e,"([a-zA-Z0-9]{32})"/;
    return script.data.match(regex)[1];
};

// jandan_decode is borrowed from jandan.net, which is used in function jandan_load_img.
const jandan_decode = (m, r) => {
    const q = 4;
    r = md5(r);
    const o = md5(r.substr(0, 16));
    const n = md5(r.substr(16, 16));
    const l = m.substr(0, q);
    const c = o + md5(o + l);
    let k;
    m = m.substr(q);
    k = base64_decode(m);

    const h = new Array(256);
    for (let g = 0; g < 256; g++) {
        h[g] = g;
    }
    const b = new Array(256);
    for (let g = 0; g < 256; g++) {
        b[g] = c.charCodeAt(g % c.length);
    }
    for (let f = 0, g = 0; g < 256; g++) {
        f = (f + h[g] + b[g]) % 256;
        [h[g], h[f]] = [h[f], h[g]];
    }

    let t = '';
    k = k.split('');
    for (let p = 0, f = 0, g = 0; g < k.length; g++) {
        p = (p + 1) % 256;
        f = (f + h[p]) % 256;
        [h[p], h[f]] = [h[f], h[p]];
        t += chr(ord(k[g]) ^ h[(h[p] + h[f]) % 256]);
    }
    if ((t.substr(0, 10) === '0' || t.substr(0, 10) - time() > 0) && t.substr(10, 16) === md5(t.substr(26) + n).substr(0, 16)) {
        t = t.substr(26);
    }
    return t;
};

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://jandan.net/pic',
        headers: {
            'User-Agent': config.ua,
            Referer: 'http://jandan.net',
        },
    });

    const $ = cheerio.load(response.data);

    let script_url = '';
    $('script').each((index, item) => {
        const s = $(item).attr('src');
        if (s && s.startsWith('//cdn.jandan.net/static/min/')) {
            script_url = s;
        }
    });
    const magic_string = await jandan_magic(script_url);

    const items = Array();
    $('.commentlist > li').each((_, item) => {
        // Get current comment id, if comment_id is 'adsense', just need to skip..
        const comment_id = $(item).attr('id');
        if (comment_id === 'adsense') {
            return;
        }

        // Get current comment's link.
        const link = $(item)
            .find('.righttext')
            .find('a')
            .attr('href');
        if (link === undefined) {
            return;
        }

        // Get current comment's images.
        // TODO: should support multiple images.
        let img_url = $(item)
            .find('.text')
            .find('.img-hash')
            .html();
        if (img_url === null) {
            return;
        }
        img_url = jandan_decode(img_url, magic_string);
        img_url = img_url.replace(/(\/\/\w+\.sinaimg\.cn\/)(\w+)(\/.+\.(gif|jpg|jpeg))/, '$1large$3');

        // TODO: should load user's comments.

        items.push({
            title: comment_id,
            description: `<img referrerpolicy="no-referrer"  src="http:${img_url}">`,
            link: `http:${link}`,
        });
    });

    ctx.state.data = {
        title: '煎蛋无聊图',
        link: 'http://jandan.net/pic',
        description: '煎蛋官方无聊图，无限活力的热门图区。',
        item: items,
    };
};
