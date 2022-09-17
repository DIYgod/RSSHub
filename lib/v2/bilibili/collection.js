const got = require('@/utils/got');
const cache = require('./cache');
const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const sid = ctx.params.sid;
    const disableEmbed = ctx.params.disableEmbed;
    const [name, face] = await cache.getUsernameAndFaceFromUID(ctx, uid);
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/polymer/space/seasons_archives_list?mid=${uid}&season_id=${sid}&sort_reverse=false&page_num=1&page_size=30`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/channel/collectiondetail?sid=${sid}`,
        },
    });
    const data = response.data;

    ctx.state.data = {
        title: `${name}的${data.data.meta.name}`,
        link: `https://space.bilibili.com/${uid}/channel/collectiondetail?sid=${sid}`,
        description: `${name} 的 bilibili 合集`,
        logo: face,
        icon: face,
        item: data.data.archives.map((item) => ({
            title: item.title,
            description: `${!disableEmbed ? `<br><br>${utils.iframe(item.aid)}` : ''}<br><img src="${item.pic}">`,
            pubDate: parseDate(item.pubdate * 1000),
            link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
            author: name,
        })),
    };
};
