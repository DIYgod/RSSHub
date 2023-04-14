const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const md = require('markdown-it')({
    html: true,
    linkify: true,
});

module.exports = {
    FetchGoItems: async (ctx) => {
        const id = ctx.params.id ?? 'weekly';
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;

        const rootUrl = 'https://studygolang.com';
        const currentUrl = `${rootUrl}/go/${id}`;

        const response = await got({
            method: 'get',
            url: currentUrl,
        });

        const $ = cheerio.load(response.data);

        let items = $('.right-info .title')
            .slice(0, limit)
            .toArray()
            .map((item) => {
                item = $(item);

                const a = item.find('a');

                return {
                    title: a.text(),
                    link: `${rootUrl}${a.attr('href')}`,
                    author: item.next().find('.author').text(),
                    category: item
                        .next()
                        .find('.node')
                        .toArray()
                        .map((n) => $(n).text()),
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

                    item.pubDate = timezone(parseDate(content('.timeago').first().attr('title')), +8);

                    try {
                        item.description = md.render(content('.content').html());
                    } catch (e) {
                        // no-empty
                    }

                    return item;
                })
            )
        );

        return {
            title: `Go语言中文网 - ${$('.title h2').text()}`,
            link: currentUrl,
            item: items,
        };
    },
};
