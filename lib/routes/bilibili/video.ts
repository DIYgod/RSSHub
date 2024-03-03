// @ts-nocheck
import got from '@/utils/got';
const cache = require('./cache');
const utils = require('./utils');
import logger from '@/utils/logger';

export default async (ctx) => {
    const uid = ctx.req.param('uid');
    const disableEmbed = ctx.req.param('disableEmbed');
    const cookie = await cache.getCookie(ctx);
    const wbiVerifyString = await cache.getWbiVerifyString(ctx);
    const dmImgList = utils.getDmImgList();
    const [name, face] = await cache.getUsernameAndFaceFromUID(ctx, uid);

    // await got(`https://space.bilibili.com/${uid}/video?tid=0&page=1&keyword=&order=pubdate`, {
    //     headers: {
    //         Referer: `https://space.bilibili.com/${uid}/`,
    //         Cookie: cookie,
    //     },
    // });
    const params = utils.addWbiVerifyInfo(utils.addDmVerifyInfo(`mid=${uid}&ps=30&tid=0&pn=1&keyword=&order=pubdate&platform=web&web_location=1550101&order_avoided=true`, dmImgList), wbiVerifyString);
    const response = await got(`https://api.bilibili.com/x/space/wbi/arc/search?${params}`, {
        headers: {
            Referer: `https://space.bilibili.com/${uid}/video?tid=0&page=1&keyword=&order=pubdate`,
            Cookie: cookie,
        },
    });
    const data = response.data;
    if (data.code) {
        logger.error(JSON.stringify(data.data));
        throw new Error(`Got error code ${data.code} while fetching: ${data.message}`);
    }

    ctx.set('data', {
        title: `${name} 的 bilibili 空间`,
        link: `https://space.bilibili.com/${uid}`,
        description: `${name} 的 bilibili 空间`,
        logo: face,
        icon: face,
        item:
            data.data &&
            data.data.list &&
            data.data.list.vlist &&
            data.data.list.vlist.map((item) => ({
                title: item.title,
                description: `${item.description}${disableEmbed ? '' : `<br><br>${utils.iframe(item.aid)}`}<br><img src="${item.pic}">`,
                pubDate: new Date(item.created * 1000).toUTCString(),
                link: item.created > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
                author: name,
                comments: item.comment,
            })),
    });
};
