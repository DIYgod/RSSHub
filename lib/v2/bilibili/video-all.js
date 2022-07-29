const got = require('@/utils/got');
const cache = require('./cache');
const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const disableEmbed = ctx.params.disableEmbed;
    const [name, face] = await cache.getUsernameAndFaceFromUID(ctx, uid);

    const response = await got(`https://api.bilibili.com/x/space/arc/search?mid=${uid}&ps=30&tid=0&pn=1&keyword=&order=pubdate&jsonp=jsonp`, {
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });

    const vlist = [...response.data.data.list.vlist];
    const pageTotal = Math.ceil(response.data.data.page.count / response.data.data.page.ps);
    const promises = [];

    if (pageTotal > 1) {
        for (let i = 2; i <= pageTotal; i++) {
            promises.push(
                got(`https://api.bilibili.com/x/space/arc/search?mid=${uid}&ps=30&tid=0&pn=${i}&keyword=&order=pubdate&jsonp=jsonp`, {
                    headers: {
                        Referer: `https://space.bilibili.com/${uid}/`,
                    },
                })
            );
        }
        const rets = await Promise.all(promises);
        rets.forEach((ret) => {
            vlist.push(...ret.data.data.list.vlist);
        });
    }

    ctx.state.data = {
        title: name,
        link: `https://space.bilibili.com/${uid}/video`,
        description: `${name} 的 bilibili 所有视频`,
        logo: face,
        icon: face,
        item: vlist.map((item) => ({
            title: item.title,
            description: `${item.description}${!disableEmbed ? `<br><br>${utils.iframe(item.aid)}` : ''}<br><img src="${item.pic}">`,
            pubDate: parseDate(item.created, 'X'),
            link: item.created > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
            author: name,
            comments: item.comment,
        })),
    };
};
