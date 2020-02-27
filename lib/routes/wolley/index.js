const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = 'https://wolley.io/';

    const response = await got({
        method: 'get',
        url: `https://wolley.io/api/submissions/list?page=1&limit=30`,
        headers: {
            Referer: link,
        },
    });

    const data = response.data.data;

    ctx.state.data = {
        title: `wolley`,
        link,
        description: '',

        item: data.map((item) => ({
            title: item.title,
            description: `via <a href=https://wolley.io/user/${item.user.handler}>@${item.user.handler}</a><br><a href=https://wolley.io/item/${item.id}>Comments</a>`,
            pubDate: item.createdAt,
            link: item.url,
        })),
    };
};
