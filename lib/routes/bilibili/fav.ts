import { Route } from '@/types';
import got from '@/utils/got';
import utils from './utils';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

export const route: Route = {
    path: '/fav/:uid/:fid/:embed?',
    categories: ['social-media'],
    example: '/bilibili/fav/756508/50948568',
    parameters: { uid: '用户 id, 可在 UP 主主页中找到', fid: '收藏夹 ID, 可在收藏夹的 URL 中找到, 默认收藏夹建议使用 UP 主默认收藏夹功能', embed: '默认为开启内嵌视频, 任意值为关闭' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'UP 主非默认收藏夹',
    maintainers: ['Qixingchen'],
    handler,
};

async function handler(ctx) {
    const fid = ctx.req.param('fid');
    const uid = ctx.req.param('uid');
    const embed = !ctx.req.param('embed');

    const response = await got({
        url: `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${fid}&ps=20`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
            Cookie: config.bilibili.cookies[uid],
        },
    });
    const { data, code, message } = response.data;
    if (code) {
        throw new Error(message ?? code);
    }

    const userName = data.info.upper.name;
    const favName = data.info.title;

    return {
        title: `${userName} 的 bilibili 收藏夹 ${favName}`,
        link: `https://space.bilibili.com/${uid}/#/favlist?fid=${fid}`,
        description: `${userName} 的 bilibili 收藏夹 ${favName}`,

        item:
            data.medias &&
            data.medias.map((item) => ({
                title: item.title,
                description: utils.renderUGCDescription(embed, item.cover, item.intro, item.id, undefined, item.bvid),
                pubDate: parseDate(item.fav_time * 1000),
                link: item.fav_time > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.id}`,
                author: item.upper.name,
            })),
    };
}
