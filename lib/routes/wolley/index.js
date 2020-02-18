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
            description: `post by <a href=https://wolley.io/user/${item.user.handler}>${item.user.handler}</a>`,
            pubDate: item.createdAt,
            link: item.url,
        })),
    };
};
