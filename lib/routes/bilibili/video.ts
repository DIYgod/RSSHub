import type { Context } from 'hono';
import JSONbig from 'json-bigint';
import { DataItem, Route, ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import cache from './cache';
import utils, { getVideoUrl } from './utils';
import logger from '@/utils/logger';
import type { BilibiliWebDynamicResponse } from './api-interface';

export const route: Route = {
    path: '/user/video/:uid/:embed?',
    categories: ['social-media', 'popular'],
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
    const [name, face] = await cache.getUsernameAndFaceFromUID(uid);

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
    let fallbackItem: DataItem[] | undefined;
    if (data.code) {
        try {
            // Fallback to get video from dynamic API
            const params = utils.addDmVerifyInfo(`host_mid=${uid}&platform=web&features=itemOpusStyle,listOnlyfans,opusBigCover,onlyfansVote`, utils.getDmImgList());
            const response = await got(`https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?${params}`, {
                headers: {
                    Referer: `https://space.bilibili.com/${uid}/`,
                    Cookie: cookie,
                },
            });
            const body = JSONbig.parse(response.body);
            if (body?.code === -352) {
                throw new Error('Request failed, please try again.');
            }
            const items = (body as BilibiliWebDynamicResponse)?.data?.items.filter((item) => item.modules.module_dynamic?.major?.type === 'MAJOR_TYPE_ARCHIVE');
            if (items && items.length > 0) {
                fallbackItem = items.map((item) => {
                    const dynamic = item?.modules?.module_dynamic?.major?.archive;
                    const author = item?.modules?.module_author;

                    const aid = dynamic?.aid;
                    const bvid = dynamic?.bvid;

                    const data: DataItem = {
                        title: dynamic?.title ?? '',
                        description: !aid && !bvid ? '' : utils.renderUGCDescription(embed, dynamic.cover, dynamic.desc, aid, undefined, bvid),
                        pubDate: author?.pub_ts ? parseDate(author.pub_ts, 'X') : undefined,
                        link: author?.pub_ts && author.pub_ts > utils.bvidTime && bvid ? `https://www.bilibili.com/video/${bvid}` : `https://www.bilibili.com/video/av${aid}`,
                        author: name ?? undefined,
                        attachments: bvid
                            ? [
                                  {
                                      url: getVideoUrl(bvid),
                                      mime_type: 'text/html',
                                  },
                              ]
                            : undefined,
                    };
                    return data;
                });
            }
        } catch {
            logger.error(JSON.stringify(data.data));
            throw new Error(`Got error code ${data.code} while fetching: ${data.message}`);
        }
    }

    return {
        title: `${name} 的 bilibili 空间`,
        link: `https://space.bilibili.com/${uid}`,
        description: `${name} 的 bilibili 空间`,
        image: face ?? undefined,
        logo: face ?? undefined,
        icon: face ?? undefined,
        item:
            fallbackItem ??
            (data.data &&
                data.data.list &&
                data.data.list.vlist &&
                data.data.list.vlist.map((item) => ({
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
                              },
                          ]
                        : undefined,
                }))),
    };
}
