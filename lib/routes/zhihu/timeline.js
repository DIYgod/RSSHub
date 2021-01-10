const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const cookie = config.zhihu.cookies;
    if (cookie === undefined) {
        throw Error('缺少知乎用户登录后的 Cookie 值');
    }

    const response = await got({
        method: 'get',
        url: `https://www.zhihu.com/api/v3/moments?limit=10`,
        headers: {
            Cookie: cookie,
        },
    });
    const feeds = response.data.data;

    const out = feeds.map((e) => ({
        title: `${e.action_text}: ${e.target.title ? e.target.title : e.target.question.title}`,
        description: `${e.target.excerpt}`,
        pubDate: new Date(e.updated_time * 1000),
        link: e.target.url.replace('api.zhihu.com', 'zhihu.com'),
        author: e.target.author.name,
        guid: e.id,
    }));

    ctx.state.data = {
        title: `知乎关注动态`,
        link: `https://www.zhihu.com/follow`,
        item: out,
    };
};
