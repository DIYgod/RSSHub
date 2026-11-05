import { html } from 'hono/html';

import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const titles = {
    0: '全部',
    15: '直播',
    3: '科技新鲜事',
    7: '互联网槽点',
    5: '趣味科技',
    6: 'DEBUG TIME',
    1: '游戏',
    8: '视频',
    9: '公里每小时',
};

export const route: Route = {
    path: '/news/:caty?',
    categories: ['new-media'],
    example: '/chaping/news/15',
    parameters: { caty: '分类，默认为全部资讯' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '资讯',
    maintainers: ['nczitzk'],
    handler,
    description: `| 编号 | 分类       |
| ---- | ---------- |
| 15   | 直播       |
| 3    | 科技新鲜事 |
| 7    | 互联网槽点 |
| 5    | 趣味科技   |
| 6    | DEBUG TIME |
| 1    | 游戏       |
| 8    | 视频       |
| 9    | 公里每小时 |`,
};

function getDescription(item) {
    if (item.type === 'live') {
        const caption = html`<p>${item.summary}</p>`;
        const video = html`<video controls src="${item.content}" poster="${item.images.url}"></video>`;
        return `${caption}${video}`;
    }
    return item.content;
}

async function handler(ctx) {
    const caty = ctx.req.param('caty') ?? '';
    if (!Object.hasOwn(titles, caty || '0')) {
        throw new NotFoundError(`Invalid category. Supported categories: ${Object.keys(titles).join(', ')}.`);
    }

    const targetUrl = `https://chaping.cn/news?cate=${caty}`;
    const currentUrl = `https://chaping.cn/api/official/information/news?page=1&limit=16&cate=${caty}`;
    const apiResponse = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = apiResponse.data.data.map((item) => ({
        title: item.title,
        link: `https://chaping.cn/news/${item.id}`,
        pubDate: parseDate(item.time_publish_timestamp * 1000),
        description: getDescription(item),
    }));

    return {
        title: `差评资讯 - ${titles[caty || '0']}`,
        link: targetUrl,
        item: list,
    };
}
