import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { parseDuration } from '@/utils/helpers';
import logger from '@/utils/logger';
import type { Context } from 'hono';
import cache from './cache';
import utils, { getVideoUrl } from './utils';
import { config } from '@/config';

export const route: Route = {
    path: '/user/video/:uid/:embed?',
    categories: ['social-media'],
    view: ViewType.Videos,
    example: '/bilibili/user/video/2267573',
    parameters: { uid: '用户 id, 可在 UP 主主页中找到', embed: '默认为开启内嵌视频, 任意值为关闭' },
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
    maintainers: ['DIYgod', 'Konano', 'pseudoyu'],
    handler,
};

async function handler(ctx: Context) {
    const uid = ctx.req.param('uid');
    const embed = !ctx.req.param('embed');
    const cookie = await cache.getCookie();
    const wbiVerifyString = await cache.getWbiVerifyString();
    const dmImgList = utils.getDmImgList();
    const dmImgInter = utils.getDmImgInter();
    const renderData = await cache.getRenderData(uid);

    const params = utils.addWbiVerifyInfo(
        utils.addRenderData(utils.addDmVerifyInfoWithInter(`mid=${uid}&ps=30&tid=0&pn=1&keyword=&order=pubdate&platform=web&web_location=1550101&order_avoided=true`, dmImgList, dmImgInter), renderData),
        wbiVerifyString
    );
    const response = await got(`https://api.bilibili.com/x/space/wbi/arc/search?${params}`, {
        headers: {
            Referer: `https://space.bilibili.com/${uid}/video?tid=0&pn=1&keyword=&order=pubdate`,
            Cookie: cookie,
        },
    });
    const data = response.data;
    if (data.code) {
        logger.error(JSON.stringify(data.data));
        throw new Error(`Got error code ${data.code} while fetching: ${data.message}`);
    }

    const usernameAndFace = await cache.getUsernameAndFaceFromUID(uid);
    const name = usernameAndFace[0] || data.data.list.vlist[0]?.author;
    const face = usernameAndFace[1];

    return {
        title: `${name} 的 bilibili 空间`,
        link: `https://space.bilibili.com/${uid}`,
        description: `${name} 的 bilibili 空间`,
        image: face ?? undefined,
        logo: face ?? undefined,
        icon: face ?? undefined,
        item:
            data.data &&
            data.data.list &&
            data.data.list.vlist &&
            (await Promise.all(
                data.data.list.vlist.map(async (item) => {
                    const subtitles = !config.bilibili.excludeSubtitles && item.bvid ? await cache.getVideoSubtitleAttachment(item.bvid) : [];
                    return {
                        title: item.title,
                        description: utils.renderUGCDescription(embed, item.pic, item.description, item.aid, undefined, item.bvid),
                        pubDate: new Date(item.created * 1000).toUTCString(),
                        link: item.created > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
                        author: name,
                        comments: item.comment,
                        attachments: item.bvid
                            ? [
                                  {
                                      url: getVideoUrl(item.bvid),
                                      mime_type: 'text/html',
                                      duration_in_seconds: parseDuration(item.length),
                                  },
                                  ...subtitles,
                              ]
                            : undefined,
                    };
                })
            )),
    };
}
