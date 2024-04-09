const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const api = 'https://www.secrss.com/api/articles?tag=';
    const { category = '' } = ctx.params;
    const host = 'https://www.secrss.com';
    const res = await got(`${api}${category}`);
    const dataArray = res.data.data;

    const items = dataArray.map((item) => ({
        title: item.title,
        description: item.summary,
        pubDate: timezone(parseDate(item.published_at), +8),
        link: `${host}/articles/${item.id}`,
        author: item.source_author,
        category: item.tags.map((t) => t.title),
    }));

    ctx.state.data = {
        title: `安全内参-${category}`,
        link: 'https://www.secrss.com',
        item: items,
    };
};
