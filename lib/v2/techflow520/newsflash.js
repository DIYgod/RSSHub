const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.techflow520.com';
    const currentUrl = `${rootUrl}/newflash`;
    const apiUrl = `${rootUrl}/index/kuaixun/load_kuaixun`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        form: {
            offect: 0,
            pageval: 50,
        },
    });

    const items = response.data.map((item) => ({
        title: item.title,
        link: `${rootUrl}/news/${item.id}`,
        description: item.content,
        pubDate: parseDate(item.time),
        category: [item.keywords],
        author: item.source,
    }));

    ctx.state.data = {
        title: '深潮TechFlow - 快讯',
        link: currentUrl,
        item: items,
    };
};
