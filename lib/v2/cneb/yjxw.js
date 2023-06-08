const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const indexs = {
    gnxw: 0,
    gjxw: 1,
};

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 400;

    const category = ctx.params.category ?? '';
    const index = indexs.hasOwnProperty(category) ? indexs[category] : -1;

    const rootUrl = 'http://www.cneb.gov.cn';
    const currentUrl = `${rootUrl}/yjxw${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    if (index !== -1) {
        const otherIndex = Math.abs(index - 1);

        $('.first-data').eq(otherIndex).remove();
        $('.moreContent').eq(otherIndex).remove();
    }

    let items = $('.list')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');

            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: timezone(parseDate(item.find('span').text()), +8),
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

                item.description = content('.w940').html();
                item.author = content('.source span').last().text();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `国家应急广播 - ${index !== -1 ? $('.select').text() : '新闻'}`,
        link: currentUrl,
        item: items,
    };
};
