const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://panewslab.com';
    const apiUrl = `${rootUrl}/webapi/flashnews?LId=1&Rn=${ctx.query.limit ?? 50}&tw=0`;
    const currentUrl = `${rootUrl}/zh/news/index.html`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.data.flashNews[0].list.map((item) => ({
        title: item.title,
        author: item.author.name,
        pubDate: parseDate(item.publishTime * 1000),
        link: `${rootUrl}/zh/articledetails/${item.id}.html`,
        description: `<p>${item.desc.replace(/\r\n原文链接/g, '')}</p>`,
        category: item.tags,
    }));

    ctx.state.data = {
        title: 'PANews - 快讯',
        link: currentUrl,
        item: items,
    };
};
