const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const baseUrl = 'https://www.pixiv.net';

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const { data } = await got(`${baseUrl}/ajax/user/${id}/profile/all`);

    const items = [
        ...data.body.novelSeries.map((item) => ({
            title: item.title,
            description: item.caption,
            link: `https://www.pixiv.net/novel/series/${item.id}`,
            author: item.userName,
            pubDate: parseDate(item.createDate),
            updated: parseDate(item.updateDate),
            category: item.tags,
        })),
        ...data.body.pickup.map((item) => ({
            title: item.title,
            description: item.description,
            link: item.contentUrl,
            author: item.userName,
            pubDate: parseDate(item.createDate),
            updated: parseDate(item.updateDate),
            category: item.tags,
        })),
    ];

    ctx.state.data = {
        title: `${data.body.novelSeries[0].userName || data.body.pickup[0].userName} 的小说`,
        link: `${baseUrl}/users/${id}/novels`,
        item: items,
    };
};
