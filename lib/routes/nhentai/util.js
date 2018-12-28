const { resolve } = require('url');
const cheerio = require('cheerio');
const axios = require('../../utils/axios');

exports.getSimple = async (url) => {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    return $('.gallery a.cover')
        .map((_, ele) => parseSimpleDetail($(ele)))
        .toArray();
};

const MAX_DETAIL = 5;
exports.getDetails = async (cache, simples) => Promise.all(simples.slice(0, MAX_DETAIL).map((simple) => cache.tryGet(simple.link, () => getDetail(simple), 24 * 60 * 60)));

const parseSimpleDetail = ($ele) => {
    const link = resolve('https://nhentai.net', $ele.attr('href'));
    const thumb = $ele.children('img');
    const thumbSrc = thumb.attr('data-src') || thumb.attr('src');
    const highResoThumbSrc = thumbSrc.replace('thumb', '1').replace('t.nhentai.net', 'i.nhentai.net');
    return {
        title: $ele.children('.caption').text(),
        link,
        pubDate: new Date().toUTCString(), // 要获得准确时间需要对每个本子都请求一遍，很麻烦
        description: `<img referrerpolicy="no-referrer" src="${highResoThumbSrc}" />`,
    };
};

const getDetail = async (simple) => {
    const { link } = simple;
    const { data } = await axios.get(link);
    const $ = cheerio.load(data);

    const galleryImgs = $('.gallerythumb img')
        .map((_, ele) => resolve('https://nhentai.net', $(ele).attr('data-src')))
        .get()
        .map((src) => src.replace(/(.+)(\d+)t\.(.+)/, (_, p1, p2, p3) => `${p1}${p2}.${p3}`)) // thumb to high-quality
        .map((src) => src.replace('t.nhentai.net', 'i.nhentai.net'));

    const renderImg = (src) => `<img referrerpolicy="no-referrer" src="${src}" /><br />`;
    return {
        ...simple,
        title: $('div#info > h2').text() || $('div#info > h1').text(),
        pubDate: new Date($('time').attr('datetime')).toUTCString(),
        description: `
            <h1>${galleryImgs.length} pages</h1>
            ${galleryImgs.map(renderImg).join('')}
        `.trim(),
    };
};
