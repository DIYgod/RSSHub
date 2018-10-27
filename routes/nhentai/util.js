const { resolve } = require('url');
const cheerio = require('cheerio');
const axios = require('../../utils/axios');

exports.getList = async (url) => {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    return $('.gallery a.cover')
        .map((_, ele) => createResult($, ele))
        .get();
};

exports.getDetail = async (url) => {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // thumb to high-quality
    let galleryThumbs = $('.gallerythumb img')
        .map((_, ele) => resolve('https://nhentai.net', $(ele).attr('data-src')))
        .get();
    galleryThumbs = galleryThumbs.map((src) => src.replace(/(.+)(\d+)t\.(.+)/, (_, p1, p2, p3) => `${p1}${p2}.${p3}`));
    galleryThumbs = galleryThumbs.map((src) => src.replace('t.nhentai.net', 'i.nhentai.net'));

    const renderImg = (src) => `<img referrerpolicy="no-referrer" src="${src}" /><br />`;
    return {
        title: $('div#info > h2').text() || $('div#info > h1').text(),
        pubDate: new Date($('time').attr('datetime')).toUTCString(),
        guid: `full:${url}`,
        description: `
            <h1>${galleryThumbs.length} pages</h1>
            ${galleryThumbs.map(renderImg).join('')}
        `.trim(),
    };
};

exports.getDetailWithCache = async (cache, info) => {
    const cached = await cache.get(`full:${info.link}`);
    if (cached) {
        return {
            ...info,
            ...cached,
        };
    } else {
        const detail = await exports.getDetail(info.link);
        cache.set(`full:${info.link}`, detail);
        return {
            ...info,
            ...detail,
        };
    }
};

function createResult($, ele) {
    const link = resolve('https://nhentai.net', $(ele).attr('href'));
    const thumbImg = $(ele).children('img');
    const thumbSrc = thumbImg.attr('data-src') || thumbImg.attr('src');
    return {
        title: $(ele)
            .children('.caption')
            .text(),
        link,
        guid: link,
        pubDate: new Date().toUTCString(), // 要获得准确时间需要对每个本子都请求一遍，很麻烦
        description: `<img referrerpolicy="no-referrer" src="${thumbSrc.replace('thumb', 'cover')}" />`,
    };
}
