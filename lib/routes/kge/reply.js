const cache = require('./cache');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const playid = ctx.params.playid;
    const url = `https://node.kg.qq.com/play?s=${playid}`;
    const play_item = await cache.getPlayInfo(ctx, url);

    ctx.state.data = {
        title: `${play_item.name} 的 评论`,
        link: url,
        allowEmpty: true,
        description: `${play_item.name} 的评论`,
        item: play_item.comments.map((item) => ({
            title: `${item.nick} : ${item.content}`,
            pubDate: timezone(parseDate(item.ctime * 1000), +8),
            link: url,
            guid: url + item.comment_id
        })),
    };
};
