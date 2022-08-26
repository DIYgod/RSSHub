const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://www.taoguba.com.cn';
    const currentUrl = `${rootUrl}/blog/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.tittle_data')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a').first();

            return {
                title: a.text(),
                link: `${rootUrl}/${a.attr('href')}`,
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

                content('#videoImg').remove();

                item.description = content('#first').html();
                item.author = content('.pcyclname').first().text();
                item.pubDate = timezone(parseDate(content('.pcyclspan').first().text()), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `淘股吧 - ${$('meta[property="og:author"]').attr('content')}`,
        link: currentUrl,
        item: items,
    };
};
