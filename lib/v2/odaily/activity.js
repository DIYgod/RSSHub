const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { rootUrl } = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = `${rootUrl}/service/scheme/group/8?page=1&per_page=${ctx.query.limit ?? 25}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let items = response.data.data.items.data.map((item) => ({
        title: item.title,
        link: `${rootUrl}/activity/${item.id}`,
        pubDate: timezone(parseDate(item.published_at), +8),
    }));

    items = await Promise.all(
        items.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data.match(/"content":"(.*)"}},"secondaryList":/)[1]);

                    content('img').each(function () {
                        content(this).attr('src', content(this).attr('src').replace(/\\"/g, ''));
                    });

                    item.description = content.html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '活动 - Odaily星球日报',
        link: `${rootUrl}/activityPage`,
        item: items,
    };
};
