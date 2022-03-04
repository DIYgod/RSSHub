const got = require('@/utils/got');
const cache = require('./cache');
const utils = require('./utils');

module.exports = async (ctx) => {
    const uid = Number.parseInt(ctx.params.uid);
    const cid = Number.parseInt(ctx.params.cid);
    const disableEmbed = ctx.params.disableEmbed;

    // 获取频道的 ctype
    const channelsLink = `https://api.bilibili.com/x/space/channel/list?mid=${uid}`;
    const channelsResponse = await ctx.cache.tryGet(channelsLink, async () => {
        const response = await got.get(channelsLink, {
            headers: {
                Referer: `https://space.bilibili.com/${uid}/`,
            },
        });
        return response.data;
    });
    const channelInfo = channelsResponse.data.list.find((channel) => channel.cid === cid);
    if (!channelInfo) {
        throw new Error('无法获取该频道信息，请报告这个问题');
    }
    const ctype = channelInfo.is_live_playback ? 1 : 0;

    const link = `https://space.bilibili.com/${uid}/detail?cid=${cid}&ctype=${ctype}`;
    const userName = await cache.getUsernameFromUID(ctx, uid);
    const host = `https://api.bilibili.com/x/space/channel/video?mid=${uid}&cid=${cid}&pn=1&ps=10&order=0&ctype=${ctype}`;

    const response = await got({
        method: 'get',
        url: host,
        headers: {
            Referer: link,
        },
    });

    let data = response.data;
    if (!data.data) {
        ctx.state.data = {
            title: '此 bilibili 频道不存在',
        };
        return;
    } else {
        data = data.data.list;
    }

    const channelName = data.name;

    ctx.state.data = {
        title: `${userName} 的 bilibili 频道 ${channelName}`,
        link,
        description: data.name,

        item: data.archives.map((item) => {
            const descList = [];
            if (item.desc) {
                descList.push(item.desc);
            }
            if (!disableEmbed) {
                descList.push(`${item.desc ? '<br>' : ''}${utils.iframe(item.aid)}`);
            }
            descList.push(`<img src="${item.pic}">`);
            return {
                title: item.title,
                description: descList.join('<br>'),
                pubDate: new Date(item.pubdate * 1000),
                link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
                author: userName,
            };
        }),
    };
};
