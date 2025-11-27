import path from 'node:path';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { art } from '@/utils/render';

import { parseArticle } from '../utils';

export const route: Route = {
    path: '/app/reporter/:id',
    categories: ['traditional-media'],
    example: '/oeeee/app/reporter/249',
    parameters: { id: '记者 UID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '南都客户端（按记者）',
    maintainers: ['TimWu007'],
    handler,
    description: `记者的 UID 可通过 \`m.mp.oeeee.com\` 下的文章页面获取。点击文章下方的作者头像，进入该作者的个人主页，即可从 url 中获取。`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 0;
    const currentUrl = `https://m.mp.oeeee.com/show.php?m=Doc&a=getAuthorInfo&id=${id}`;

    const { data: response } = await got(currentUrl);

    const list = response.data.list.map((item) => ({
        title: '【' + item.media_nickname + '】' + item.title,
        description: art(path.join(__dirname, '../templates/description.art'), {
            thumb: item.titleimg,
            description: item.summary,
        }),
        link: item.url,
    }));

    const author = response.data.info ? response.data.info.name : '';

    const items = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    return {
        title: `南方都市报奥一网 - ${author}`,
        link: `https://m.mp.oeeee.com/w/${id}.html`,
        item: items,
    };
}
