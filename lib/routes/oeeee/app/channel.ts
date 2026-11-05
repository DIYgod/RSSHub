import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from '../templates/description';
import { parseArticle } from '../utils';

export const route: Route = {
    path: '/app/channel/:id',
    categories: ['traditional-media'],
    example: '/oeeee/app/channel/50',
    parameters: { id: '南都号 ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '南都客户端（按南都号 ID）',
    maintainers: ['TimWu007'],
    handler,
    description: '南都号的 UID 可通过 `m.mp.oeeee.com` 下的文章页面获取。点击文章上方的南都号头像，进入该南都号的个人主页，即可从 url 中获取。',
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 50;
    const currentUrl = `https://api-ndapp.oeeee.com/friends.php?m=Zone&a=SpaceDoclist&uid=${id}&type=doc`;

    const { data: response } = await got(currentUrl);

    const list: Array<DataItem & { link: string }> = response.data
        .filter((i) => i.url) // Remove banner and sticky articles.
        .map((item) => ({
            title: item.title,
            description: renderDescription({
                thumb: item.titleimg.replaceAll(/\?x-oss-process=.*/g, ''),
                description: item.summary,
            }),
            pubDate: [undefined, null, ''].includes(item.ptime) ? undefined : parseDate(Number(item.ptime) * 1000),
            link: item.url,
        }));

    const channel = response.data.find((item) => item.url)?.author ?? '';

    const items = await pMap(list, (item) => parseArticle(item), { concurrency: 3 });

    return {
        title: `南方都市报客户端 - ${channel}`,
        link: `https://m.mp.oeeee.com/u/${id}.html`,
        item: items,
    };
}
