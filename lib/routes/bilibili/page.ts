import { Route } from '@/types';
import got from '@/utils/got';
import utils from './utils';

export const route: Route = {
    path: '/video/page/:bvid/:disableEmbed?',
    categories: ['social-media'],
    example: '/bilibili/video/page/BV1i7411M7N9',
    parameters: { bvid: '可在视频页 URL 中找到', disableEmbed: '默认为开启内嵌视频, 任意值为关闭' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '视频选集列表',
    maintainers: ['sxzz'],
    handler,
};

async function handler(ctx) {
    let bvid = ctx.req.param('bvid');
    let aid;
    if (!bvid.startsWith('BV')) {
        aid = bvid;
        bvid = null;
    }
    const disableEmbed = ctx.req.param('disableEmbed');
    const link = `https://www.bilibili.com/video/${bvid || `av${aid}`}`;
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/view?${bvid ? `bvid=${bvid}` : `aid=${aid}`}`,
        headers: {
            Referer: link,
        },
    });

    const { title: name, pages: data } = response.data.data;

    return {
        title: `视频 ${name} 的选集列表`,
        link,
        description: `视频 ${name} 的视频选集列表`,
        item: data
            .sort((a, b) => b.page - a.page)
            .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10)
            .map((item) => ({
                title: item.part,
                description: `${item.part} - ${name}${disableEmbed ? '' : `<br><br>${utils.iframe(aid, item.page, bvid)}`}`,
                link: `${link}?p=${item.page}`,
            })),
    };
}
