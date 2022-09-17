const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const api = 'https://api.anquanke.com/data/v1/posts?size=10&page=1&category=';
    const type = ctx.params.category;
    const host = 'https://www.anquanke.com';
    const res = await got(`${api}${type}`);
    const dataArray = res.data.data;

    const items = dataArray.map((item) => ({
        title: item.title,
        description: item.desc,
        pubDate: timezone(parseDate(item.date), +8),
        link: `${host}/${type === 'week' ? 'week' : 'post'}/id/${item.id}`,
        author: item.author.nickname,
    }));

    ctx.state.data = {
        title: `安全客-${dataArray[0].category_name}`,
        link: `https://www.anquanke.com/${type === 'week' ? 'week-list' : type}`,
        item: items,
    };
};
