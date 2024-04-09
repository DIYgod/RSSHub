const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    ctx.path = ctx.path.replace(/(^\/cmse|\/$)/g, '');

    const rootUrl = 'http://www.cmse.gov.cn';
    const currentUrl = `${rootUrl}${ctx.path === '' ? '/xwzx/zhxw/' : `${ctx.path}/`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('#list li a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 15)
        .toArray()
        .map((item) => {
            item = $(item);

            const pubDate = item.next().text();
            const link = new URL(item.attr('href'), currentUrl).href;

            return {
                title: item.text(),
                pubDate: parseDate(pubDate),
                link: /\.html$/.test(link) ? link : `${link}#${pubDate}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('.share').remove();

                const detailPubTimeMatches = detailResponse.data.match(/__\$pubtime='(.*?)';var/);

                item.pubDate = detailPubTimeMatches ? timezone(parseDate(detailPubTimeMatches[1]), +8) : item.pubDate;
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    video: content('#con_video').html(),
                    description: content('.TRS_Editor, #content').html(),
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
