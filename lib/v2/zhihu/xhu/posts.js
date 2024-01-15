const got = require('@/utils/got');
const auth = require('./auth');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const xhuCookie = await auth.getCookie(ctx);
    const { hexId } = ctx.params;
    const link = `https://www.zhihu.com/people/${hexId}/posts`;
    const url = `https://api.zhihuvvv.workers.dev/people/${hexId}/articles?limit=20&offset=0`;

    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: 'https://api.zhihuvvv.workers.dev',
            Cookie: xhuCookie,
        },
    });
    const data = response.data.data;

    ctx.state.data = {
        title: `${data[0].author.name} 的知乎文章`,
        link,
        image: data[0].author.avatar_url,
        description: data[0].author.headline,
        item: data.map((item) => ({
            title: item.title,
            description: item.excerpt,
            pubDate: parseDate(item.created * 1000),
            link: `https://zhuanlan.zhihu.com/p/${item.id}`,
            author: item.author.name,
        })),
    };
};
