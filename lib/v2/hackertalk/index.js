const got = require('@/utils/got');
const md = require('markdown-it')();

module.exports = async (ctx) => {
    const limit = ctx.params.limit || 25;

    const response = await got({
        method: 'get',
        url: `https://api.hackertalk.net/v1/posts?limit=${limit}&orderBy=time`,
    });

    const data = response.data.data;

    ctx.state.data = {
        title: '黑客说的最新帖子',
        link: 'https://hackertalk.net/?tab=new',
        description: '黑客说 - 技术驱动优质交流',
        item: data.map((item) => ({
            title: item.title,
            description: md.render(item.content),
            pubDate: new Date(item.createdAt).toUTCString(),
            link: `https://hackertalk.net/posts/${item.id}`,
        })),
    };
};
