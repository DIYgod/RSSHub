const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { rootUrl } = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = `${rootUrl}/api/pp/api/info-flow/newsflash_columns/newsflashes?b_id=&per_page=${ctx.query.limit ?? 100}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const items = response.data.data.items.map((item) => ({
        title: item.title,
        link: item.news_url,
        pubDate: timezone(parseDate(item.published_at), +8),
        description: `<p>${item.description}</p>`,
    }));

    ctx.state.data = {
        title: '快讯 - Odaily星球日报',
        link: `${rootUrl}/newsflash`,
        item: items,
    };
};
