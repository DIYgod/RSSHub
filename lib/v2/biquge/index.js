const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = ctx.path.split('/').slice(1, 4).join('/');
    const currentUrl = ctx.path.slice(1);

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
        https: {
            rejectUnauthorized: false,
        },
    });

    const isGBK = /charset="?'?gb/i.test(response.data.toString());
    const encoding = isGBK ? 'gbk' : 'utf-8';

    const $ = cheerio.load(iconv.decode(response.data, encoding));
    const author = $('meta[property="og:novel:author"]').attr('content');
    const pubDate = timezone(parseDate($('meta[property="og:novel:update_time"]').attr('content')), +8);

    let items = $('dl dd a')
        .toArray()
        .reverse()
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 1)
        .map((item) => {
            item = $(item);

            let link = '';
            const url = item.attr('href');
            if (/^http/.test(url)) {
                link = url;
            } else if (/^\//.test(url)) {
                link = `${rootUrl}${url}`;
            } else {
                link = `${currentUrl}/${url}`;
            }

            return {
                title: item.text(),
                link,
                author,
                pubDate,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                    https: {
                        rejectUnauthorized: false,
                    },
                });

                const content = cheerio.load(iconv.decode(detailResponse.data, encoding));

                item.description = content('#content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('meta[property="og:title"]').attr('content')} - 笔趣阁`,
        link: currentUrl,
        item: items,
    };
};
