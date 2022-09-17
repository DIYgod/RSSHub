const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { unescapeAll } = require('markdown-it/lib/common/utils');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.techflowpost.com';
    const apiRootUrl = 'https://data.techflowpost.com';
    const currentUrl = `${rootUrl}/express`;
    const apiUrl = `${apiRootUrl}/api/pc/express/all?pageIndex=0&pageSize=${ctx.query.limit ?? 50}`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        json: {
            createTime: [],
        },
    });

    const items = response.data.content.map((item) => ({
        title: item.title,
        link: `${rootUrl}/express/${item.id}`,
        category: item.tags?.split('，') ?? [],
        pubDate: timezone(parseDate(item.createTime), +8),
        description: unescapeAll(item.content),
    }));

    ctx.state.data = {
        title: '深潮TechFlow - 快讯',
        link: currentUrl,
        item: items,
    };
};
