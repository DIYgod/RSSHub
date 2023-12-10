const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { finishArticleItem } = require('@/utils/wechat-mp');
const config = require('@/config').value;
const baseUrl = 'https://www.nmpa.gov.cn';
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const path = ctx.params[0];
    const url = `${baseUrl}/${path.endsWith('/') ? path.slice(0, -1) : path}/index.html`;
    const data = await ctx.cache.tryGet(
        url,
        async () => {
            const { data: html } = await got(url);
            const $ = cheerio.load(html);

            return {
                title: $('head title').text(),
                description: $('meta[name=ColumnDescription]').attr('content'),
                items: $('.list ul li')
                    .toArray()
                    .map((item) => {
                        item = $(item);
                        return {
                            title: item.find('a').text().trim(),
                            link: new URL(item.find('a').attr('href'), baseUrl).href,
                            pubDate: parseDate(item.find('span').text(), 'YYYY-MM-DD'),
                        };
                    }),
            };
        },
        config.cache.routeExpire,
        false
    );

    const items = await Promise.all(
        data.items.map((item) => {
            if (/^https:\/\/www\.nmpa\.gov\.cn\//.test(item.link)) {
                return ctx.cache.tryGet(item.link, async () => {
                    const { data: html } = await got(item.link);
                    const $ = cheerio.load(html);
                    item.description = $('.text').html();
                    item.pubDate = timezone(parseDate($('meta[name="PubDate"]').attr('content')), +8);
                    return item;
                });
            } else if (/^https:\/\/mp\.weixin\.qq\.com\//.test(item.link)) {
                return finishArticleItem(ctx, item);
            } else {
                return item;
            }
        })
    );

    ctx.state.data = {
        title: data.title,
        description: data.description,
        link: url,
        item: items,
    };
};
