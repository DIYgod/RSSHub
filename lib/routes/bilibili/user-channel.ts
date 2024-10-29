import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import cacheIn from './cache';
import utils from './utils';

const notFoundData = {
    title: '此 bilibili 频道不存在',
};

export const route: Route = {
    path: '/user/channel/:uid/:sid/:embed?',
    categories: ['social-media'],
    example: '/bilibili/user/channel/2267573/396050',
    parameters: { uid: '用户 id, 可在 UP 主主页中找到', sid: '频道 id, 可在频道的 URL 中找到', embed: '默认为开启内嵌视频, 任意值为关闭' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'UP 主频道的视频列表',
    maintainers: ['weirongxu'],
    handler,
};

async function handler(ctx) {
    const uid = Number.parseInt(ctx.req.param('uid'));
    const sid = Number.parseInt(ctx.req.param('sid'));
    const embed = !ctx.req.param('embed');
    const limit = ctx.req.query('limit') ?? 25;

    const link = `https://space.bilibili.com/${uid}/channel/seriesdetail?sid=${sid}`;

    // 获取频道信息
    const channelInfoLink = `https://api.bilibili.com/x/series/series?series_id=${sid}`;
    const channelInfo = await cache.tryGet(channelInfoLink, async () => {
        const response = await got(channelInfoLink, {
            headers: {
                Referer: link,
            },
        });
        // 频道不存在时返回 null
        return response.data.data;
    });

    if (!channelInfo) {
        return notFoundData;
    }
    const [userName, face] = await cacheIn.getUsernameAndFaceFromUID(uid);
    const host = `https://api.bilibili.com/x/series/archives?mid=${uid}&series_id=${sid}&only_normal=true&sort=desc&pn=1&ps=${limit}`;

    const response = await got(host, {
        headers: {
            Referer: link,
        },
    });

    const data = response.data.data;
    if (!data.archives) {
        return notFoundData;
    }

    return {
        title: `${userName} 的 bilibili 频道 ${channelInfo.meta.name}`,
        link,
        description: `${userName} 的 bilibili 频道`,
        logo: face,
        icon: face,
        item: data.archives.map((item) => ({
            title: item.title,
            description: utils.renderUGCDescription(embed, item.pic, '', item.aid, undefined, item.bvid),
            pubDate: parseDate(item.pubdate, 'X'),
            link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
            author: userName,
        })),
    };
}
