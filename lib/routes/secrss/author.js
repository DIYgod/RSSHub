const got = require('@/utils/got');

module.exports = async (ctx) => {
    const api = 'https://www.secrss.com/api/articles/group?author=';
    const author = ctx.params.author;
    const host = 'https://www.secrss.com';
    const res = await got.get(`${api}${author}`);
    const dataArray = res.data.data.list;

    const items = dataArray.map((item) => ({
        title: item.title,
        description: item.summary,
        pubDate: new Date(item.original_timestamp * 1000).toUTCString(),
        link: `${host}${item.url}`,
    }));

    ctx.state.data = {
        title: `安全内参-${author}`,
        link: 'https://www.secrss.com',
        item: items,
    };
};
