import { Route } from '@/types';
import got from '@/utils/got';
import cache from './cache';
import utils from './utils';
import logger from '@/utils/logger';

export const route: Route = {
    path: '/user/video/:uid/:disableEmbed?',
    categories: ['social-media', 'popular'],
    example: '/bilibili/user/video/2267573',
    parameters: { uid: '用户 id, 可在 UP 主主页中找到', disableEmbed: '默认为开启内嵌视频, 任意值为关闭' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['space.bilibili.com/:uid'],
            target: '/user/video/:uid',
        },
    ],
    name: 'UP 主投稿',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const disableEmbed = ctx.req.param('disableEmbed');
    const cookie = await cache.getCookie();
    const wbiVerifyString = await cache.getWbiVerifyString();
    const dmImgList = utils.getDmImgList();
    const [name, face] = await cache.getUsernameAndFaceFromUID(uid);

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

    return {
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
    };
}
