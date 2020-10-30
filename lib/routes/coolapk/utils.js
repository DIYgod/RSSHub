const md5 = require('@/utils/md5');
const cheerio = require('cheerio');
const got = require('@/utils/got');

const dynamicTpye = { 0: '基本动态', 9: '评论', 20: '交易动态' };

const getRandomDEVICE_ID = () => {
    let id = [8, 4, 4, 4, 12];
    id = id.map((i) => Math.random().toString(36).substr(2, i));
    return id.join('-');
};

const get_app_token = () => {
    const DEVICE_ID = getRandomDEVICE_ID();
    const now = Math.round(new Date().getTime() / 1000);
    const hex_now = '0x' + now.toString(16);
    const md5_now = md5(now.toString());
    const s = 'token://com.coolapk.market/c67ef5943784d09750dcfbb31020f0ab?' + md5_now + '$' + DEVICE_ID + '&com.coolapk.market';
    const md5_s = md5(Buffer.from(s).toString('base64'));
    const token = md5_s + DEVICE_ID + hex_now;
    return token;
};

const base_url = 'https://api.coolapk.com';

const getHeaders = () => ({
    'X-Requested-With': 'XMLHttpRequest',
    'X-App-Id': 'com.coolapk.market',
    'X-App-Token': get_app_token(),
    'X-Sdk-Int': '29',
    'X-Sdk-Locale': 'zh-CN',
    'X-App-Version': '10.4',
    'X-App-Code': '2007081',
    'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 10; Redmi K30 5G MIUI/V12.0.3.0.QGICMXM) (#Build; Redmi; Redmi K30 5G; QKQ1.191222.002 test-keys; 10) +CoolMarket/10.4-2007081',
});

const parseTuwenFromRaw = (raw) =>
    raw.map((i) => {
        if (i.type === 'text') {
            return `<p>${i.message}</p>`;
        } else if (i.type === 'image') {
            return `<div class="img-container" style="text-align: center;">
                <img src="${i.url}">
                <p class="image-caption" style="text-align: center;">${i.description}</p></div>`;
        } else {
            // console.log(i)
            return `Unkown type`;
        }
    });

const parseDongtai = async (item, ctx) => {
    const author = item.username;
    const pubdate = new Date(item.lastupdate * 1000).toUTCString();
    const itemUrl = item.shareUrl.split('?')[0];
    let description;
    if (item.issummary) {
        // 需要爬内容
        description = await ctx.cache.tryGet(itemUrl, async () => {
            const result = await got({
                method: 'get',
                url: itemUrl,
                headers: getHeaders(),
            });
            const message = `<p>` + result.data.data.message.split('\n').join('<br>') + `</p>`;
            const picArr = item.picArr.filter((i) => i).map((i) => `<img src="${i}">`); // 若无图片，item.picArr=[""]
            return message + picArr.join('');
        });
    } else {
        const picArr = item.picArr.filter((i) => i).map((i) => `<img src="${i}">`);
        description = `<p>` + item.message + `</p>` + picArr.join('');
    }
    const $ = cheerio.load('<div class="title-filter">' + description + '</div>');
    const title = $('.title-filter').text().slice(0, 30).trim() + '...';
    return {
        title: title,
        description: description,
        pubDate: pubdate,
        link: itemUrl,
        author: author,
    };
};

const parseTuwen = async (item, ctx) => {
    const title = item.title;
    const pubdate = new Date(item.lastupdate * 1000).toUTCString();
    const author = item.username;

    const description = await ctx.cache.tryGet(item.shareUrl, async () => {
        const result = await got({
            method: 'get',
            url: item.shareUrl,
            headers: getHeaders(),
        });

        const raw = JSON.parse(result.data.data.message_raw_output);

        const tags = parseTuwenFromRaw(raw);

        return `<img src="${result.data.data.pic}"><hr>` + tags.join('');
    });

    return {
        title: title,
        description: description,
        pubDate: pubdate,
        link: item.shareUrl,
        guid: item.shareUrl.split('?')[0],
        author: author,
    };
};

module.exports = {
    get_app_token,
    base_url,
    getHeaders,
    parseTuwen,
    parseDongtai,
    dynamicTpye,
};
