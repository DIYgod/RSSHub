const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const api = 'https://www.secrss.com/api/articles/group?author=';
    const author = ctx.params.author;
    const host = 'https://www.secrss.com';
    const res = await got(`${api}${author}`);
    const dataArray = res.data.data.list;

    const items = dataArray.map((item) => ({
        title: item.title,
        description: item.summary,
        pubDate: parseDate(item.original_timestamp, 'X'),
        link: `${host}${item.url}`,
        category: item.tag,
    }));

    ctx.state.data = {
        title: `安全内参-${author}`,
        link: 'https://www.secrss.com',
        item: items,
    };
};
