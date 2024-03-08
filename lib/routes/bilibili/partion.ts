import { Route } from '@/types';
import got from '@/utils/got';
import utils from './utils';

export const route: Route = {
    path: '/partion/:tid/:disableEmbed?',
    categories: ['new-media'],
    example: '/bilibili/partion/33',
    parameters: { tid: '分区 id', disableEmbed: '默认为开启内嵌视频, 任意值为关闭' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分区视频',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const tid = ctx.req.param('tid');
    const disableEmbed = ctx.req.param('disableEmbed');

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/web-interface/newlist?ps=15&rid=${tid}&_=${Date.now()}`,
        headers: {
            Referer: 'https://www.bilibili.com/',
        },
    });

    const list = response.data.data.archives;
    let name = '未知';
    if (list && list[0] && list[0].tname) {
        name = list[0].tname;
    }

    return {
        title: `bilibili ${name}分区`,
        link: 'https://www.bilibili.com',
        description: `bilibili ${name}分区`,
        item:
            list &&
            list.map((item) => ({
                title: item.title,
                description: `${item.desc}${disableEmbed ? '' : `<br><br>${utils.iframe(item.aid)}`}<br><img src="${item.pic}">`,
                pubDate: new Date(item.pubdate * 1000).toUTCString(),
                link: item.pubdate > utils.bvidTime && item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : `https://www.bilibili.com/video/av${item.aid}`,
                author: item.owner.name,
            })),
    };
}
