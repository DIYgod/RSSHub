const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const cache = require('./cache');
const utils = require('./utils');

const notFoundData = {
    title: '此 bilibili 频道不存在',
};

module.exports = async (ctx) => {
    const uid = parseInt(ctx.params.uid);
    const sid = parseInt(ctx.params.sid);
    const disableEmbed = ctx.params.disableEmbed;
    const limit = ctx.query.limit ?? 25;

    const link = `https://space.bilibili.com/${uid}/channel/seriesdetail?sid=${sid}`;

    // 获取频道信息
    const channelInfoLink = `https://api.bilibili.com/x/series/series?series_id=${sid}`;
    const channelInfo = await ctx.cache.tryGet(channelInfoLink, async () => {
        const response = await got(channelInfoLink, {
            headers: {
                Referer: link,
            },
        });
        // 频道不存在时返回 null
        return response.data.data;
    });

    if (!channelInfo) {
        ctx.state.data = notFoundData;
        return;
    }
    const [userName, face] = await cache.getUsernameAndFaceFromUID(ctx, uid);
    const host = `https://api.bilibili.com/x/series/archives?mid=${uid}&series_id=${sid}&only_normal=true&sort=desc&pn=1&ps=${limit}`;

    const response = await got(host, {
        headers: {
            Referer: link,
        },
    });

    const data = response.data.data;
    if (!data.archives) {
        ctx.state.data = notFoundData;
        return;
    }

    ctx.state.data = {
        title: `${userName} 的 bilibili 频道 ${channelInfo.meta.name}`,
        link,
        description: `${userName} 的 bilibili 频道`,
        logo: face,
        icon: face,
        item: data.archives.map((item) => {
            const descList = [];
            if (!disableEmbed) {
                descList.push(utils.iframe(item.aid));
            }
            descList.push(`<img src="${item.pic}">`);
            return {
                title: item.title,
                description: descList.join('<br>'),
                pubDate: parseDate(item.pubdate, 'X'),
                link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
                author: userName,
            };
        }),
    };
};
