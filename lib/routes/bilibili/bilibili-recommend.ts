import { Route } from '@/types';
import got from '@/utils/got';
import utils from './utils';

export const route: Route = {
    path: '/precious/:disableEmbed?',
    categories: ['social-media'],
    example: '/bilibili/precious',
    parameters: { disableEmbed: '默认为开启内嵌视频, 任意值为关闭' },
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
    const disableEmbed = ctx.req.param('disableEmbed');
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
            description: `${item.desc || item.title}${disableEmbed ? '' : `<br><br>${utils.iframe(item.aid, null, item.bvid)}`}<br><img src="${item.pic}">`,
            link: item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
        })),
    };
}
