const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

function getPubDate(yyyyMMddhhmmss) {
    const yyyy = yyyyMMddhhmmss.slice(0, 4);
    const MM = yyyyMMddhhmmss.slice(4, 6);
    const dd = yyyyMMddhhmmss.slice(6, 8);
    const hh = yyyyMMddhhmmss.slice(8, 10);
    const mm = yyyyMMddhhmmss.slice(10, 12);
    const ss = yyyyMMddhhmmss.slice(12, 14);
    return new Date(`${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}+0900`);
}

module.exports = async (ctx) => {
    const baseURL = 'https://anond.hatelabo.jp';

    const archiveIndex = await got({
        method: 'get',
        url: url.resolve(baseURL, '/archive'),
    });

    const latestURL = url.resolve(baseURL, cheerio.load(archiveIndex.data)('.archives a').first().attr('href'));
    const response = await got({
        method: 'get',
        url: latestURL,
    });

    const $ = cheerio.load(response.data);
    const list = $('.archives li');

    ctx.state.data = {
        title: 'はてな匿名ダイアリー - 人気記事アーカイブ',
        link: 'https://anond.hatelabo.jp/archive',
        language: 'ja',
        item:
            list &&
            list
                .map((idx, item) => {
                    item = $(item);
                    const a = item.find('a').first();
                    const yyyyMMddhhmmss = a.attr('href').replace('/', '');
                    return {
                        title: a.text(),
                        description: item.find('blockquote p').first().text(),
                        link: url.resolve(baseURL, a.attr('href')),
                        pubDate: getPubDate(yyyyMMddhhmmss).toUTCString(),
                    };
                })
                .get(),
    };
};
