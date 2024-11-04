import { Route } from '@/types';
import got from '@/utils/got';
import utils from './utils';

export const route: Route = {
    path: '/precious/:embed?',
    categories: ['social-media'],
    example: '/bilibili/precious',
    parameters: { embed: '默认为开启内嵌视频, 任意值为关闭' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '入站必刷',
    maintainers: ['liuyuhe666'],
    handler,
};

async function handler(ctx) {
    const embed = !ctx.req.param('embed');
    const response = await got({
        method: 'get',
        url: 'https://api.bilibili.com/x/web-interface/popular/precious',
        headers: {
            Referer: 'https://www.bilibili.com/v/popular/history',
        },
    });
    const data = response.data.data.list;
    return {
        title: '哔哩哔哩入站必刷',
        link: 'https://www.bilibili.com/v/popular/history',
        item: data.map((item) => ({
            title: item.title,
            description: utils.renderUGCDescription(embed, item.pic, item.desc || item.title, item.aid, undefined, item.bvid),
            link: item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
        })),
    };
}
