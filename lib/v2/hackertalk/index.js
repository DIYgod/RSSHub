const got = require('@/utils/got');
const md = require('markdown-it')();
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ?? 25;

    const response = await got(`https://api.hackertalk.net/v1/posts?limit=${limit}&orderBy=time`);

    const data = response.data.data;

    ctx.state.data = {
        title: '黑客说的最新帖子',
        link: 'https://hackertalk.net/?tab=new',
        description: '黑客说 - 技术驱动优质交流',
        item: data.map((item) => ({
            title: item.title,
            description: md.render(item.content),
            pubDate: parseDate(item.createdAt),
            link: `https://hackertalk.net/posts/${item.id}`,
        })),
    };
};
