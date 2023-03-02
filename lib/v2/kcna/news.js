const got = require('@/utils/got');
const cheerio = require('cheerio');
const asyncPool = require('tiny-async-pool');
const { art } = require('@/utils/render');
const { parseJucheDate, fixDesc, fetchPhoto, fetchVideo } = require('./utils');
const path = require('path');

module.exports = async (ctx) => {
    const { lang, category = '1ee9bdb7186944f765208f34ecfb5407' } = ctx.params;

    const rootUrl = 'http://www.kcna.kp';
    const pageUrl = `${rootUrl}/${lang}/category/articles/q/${category}.kcmsf`;

    const response = await got(pageUrl);
    const $ = cheerio.load(response.data);

    // fix <nobr><span class="fSpecCs">???</span></nobr>
    const title = $('head > title')
        .text()
        .replace(/<[^>]*>/g, '');

    const list = $('.article-link li a')
        .map((_, item) => {
            item = $(item);
            const dateElem = item.find('.publish-time');
            const dateString = dateElem.text();
            dateElem.remove();
            return {
                title: item.text(),
                link: rootUrl + item.attr('href'),
                pubDate: parseJucheDate(dateString),
            };
        })
        .get();

    // avoid being IP-banned
    // if being banned, 103.35.255.254 (the last hop before www.kcna.kp - 175.45.176.71) will drop the packet
    // verify that with `mtr www.kcna.kp -Tz`
    const items = [];
    for await (const item of asyncPool(3, list, (item) =>
        ctx.cache.tryGet(item.link, async () => {
            const response = await got(item.link);
            const $ = cheerio.load(response.data);
            item.title = $('article-main-title').text() || item.title;

            const dateElem = $('.publish-time');
            const dateString = dateElem.text();
            dateElem.remove();
            item.pubDate = parseJucheDate(dateString) || item.pubDate;

            const description = fixDesc($, $('.article-content-body .content-wrapper'));

            // add picture and video
            const media = $('.media-icon a')
                .map((_, elem) => rootUrl + elem.attribs.href)
                .get();
            let photo, video;
            await Promise.all(
                media.map(async (medium) => {
                    if (medium.includes('/photo/')) {
                        photo = await fetchPhoto(ctx, medium);
                    } else if (medium.includes('/video/')) {
                        video = await fetchVideo(ctx, medium);
                    }
                })
            );

            item.description = art(path.join(__dirname, 'templates/news.art'), { description, photo, video });

            return item;
        })
    )) {
        items.push(item);
    }

    ctx.state.data = {
        title,
        link: pageUrl,
        item: items,
    };
};
