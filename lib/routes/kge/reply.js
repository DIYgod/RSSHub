const cache = require('./cache');

module.exports = async (ctx) => {
    const playid = ctx.params.playid;
    const url = `https://node.kg.qq.com/play?s=${playid}&g_f=personal&appsource=`;
    const play_item = await cache.getPlayInfo(ctx, url);

    ctx.state.data = {
        title: `${play_item.name} 的 评论`,
        link: url,
        allowEmpty: true,
        description: `${play_item.name} 的评论`,
        item: play_item.comments.map((item) => ({
            title: `${item.nick} : ${item.content}`,
            description: `${item.nick} : ${item.content}`,
            pubDate: new Date(item.ctime * 1000).toUTCString(),
            link: url,
        })),
    };
};
