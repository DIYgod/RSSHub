const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { unescapeAll } = require('markdown-it/lib/common/utils');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.techflowpost.com';
    const apiRootUrl = 'https://data.techflowpost.com';
    const apiUrl = `${apiRootUrl}/api/pc/home/more?pageIndex=0&pageSize=${ctx.query.limit ?? 50}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.content.map((item) => ({
        title: item.title,
        author: item.source,
        link: `${rootUrl}/article/${item.id}`,
        category: item.tagList.map((t) => t.name),
        pubDate: timezone(parseDate(item.createTime), +8),
        description: unescapeAll(item.content),
    }));

    ctx.state.data = {
        title: '深潮TechFlow',
        link: rootUrl,
        item: items,
    };
};
