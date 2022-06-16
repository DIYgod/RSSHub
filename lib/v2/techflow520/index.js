const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '头条';

    const rootUrl = 'https://www.techflow520.com';
    const apiUrl = `${rootUrl}/index/index/tab_centet`;

    const response = await got({
        method: 'post',
        url: apiUrl,
        form: {
            offect: 0,
            typename: category,
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
        title: `深潮TechFlow - ${category}`,
        link: rootUrl,
        item: items,
    };
};
