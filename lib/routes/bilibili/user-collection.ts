import { Route } from '@/types';
import got from '@/utils/got';
import cache from './cache';
import utils from './utils';
import { parseDate } from '@/utils/parse-date';
import { queryToBoolean } from '@/utils/readable-social';

const notFoundData = {
    title: '此 bilibili 频道不存在',
};

export const route: Route = {
    path: '/user/collection/:uid/:sid/:embed?/:sortReverse?/:page?',
    categories: ['social-media'],
    example: '/bilibili/user/collection/245645656/529166',
    parameters: {
        uid: '用户 id, 可在 UP 主主页中找到',
        sid: '合集 id, 可在合集页面的 URL 中找到',
        embed: '默认为开启内嵌视频, 任意值为关闭',
        sortReverse: '默认:默认排序 1:升序排序',
        page: '页码, 默认1',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'UP 主频道的合集',
    maintainers: ['shininome', 'cscnk52'],
    handler,
};

async function handler(ctx) {
    const uid = Number.parseInt(ctx.req.param('uid'));
    const sid = Number.parseInt(ctx.req.param('sid'));
    const embed = queryToBoolean(ctx.req.param('embed') || 'true');
    const sortReverse = Number.parseInt(ctx.req.param('sortReverse')) === 1;
    const page = ctx.req.param('page') ? Number.parseInt(ctx.req.param('page')) : 1;
    const limit = ctx.req.query('limit') ?? 25;

    const link = `https://space.bilibili.com/${uid}/channel/collectiondetail?sid=${sid}`;
    const [userName, face] = await cache.getUsernameAndFaceFromUID(uid);
    const host = `https://api.bilibili.com/x/polymer/web-space/seasons_archives_list?mid=${uid}&season_id=${sid}&sort_reverse=${sortReverse}&page_num=${page}&page_size=${limit}`;

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
        title: `${userName} 的 bilibili 合集 ${data.meta.name}`,
        link,
        description: `${userName} 的 bilibili 合集`,
        image: face,
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
