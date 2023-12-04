const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { art } = require('@/utils/render');
const path = require('path');

const parseDyArticle = (charset, item, tryGet) =>
    tryGet(item.link, async () => {
        const response = await got(item.link, {
            responseType: 'buffer',
        });

        const html = iconv.decode(response.data, charset);
        const $ = cheerio.load(html);

        $('.post_main img').each((_, i) => {
            if (!i.attribs.src) {
                return;
            }
            const url = new URL(i.attribs.src);
            if (url.host === 'nimg.ws.126.net') {
                i.attribs.src = url.searchParams.get('url');
            }
        });

        item.description = art(path.join(__dirname, 'templates/dy.art'), {
            imgsrc: item.imgsrc?.split('?')[0],
            postBody: $('.post_body').html(),
        });

        item.feedLink = $('.post_wemedia_name a').attr('href');
        item.feedDescription = $('.post_wemedia_title').text();
        item.feedImage = $('.post_wemedia_avatar img').attr('src');

        return item;
    });

module.exports = {
    parseDyArticle,
};
