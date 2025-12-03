import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

import utils from './utils';

export const route: Route = {
    path: '/:type/:name?',
    categories: ['programming'],
    example: '/aijishu/channel/ai',
    parameters: { type: '文章类型，可以取值如下', name: '名字，取自URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '频道、专栏、用户',
    maintainers: [],
    handler,
    description: `| type    | 说明 |
| ------- | ---- |
| channel | 频道 |
| blog    | 专栏 |
| u       | 用户 |`,
};

async function handler(ctx) {
    const { type, name = 'newest' } = ctx.req.param();
    const u = name === 'newest' ? `https://aijishu.com/` : `https://aijishu.com/${type}/${name}`;
    const html = await got(u);

    const $ = load(html.data);
    const title = $('title').text();
    const api_path = $('li[data-js-stream-load-more]').attr('data-api-url');

    const channel_url = `https://aijishu.com${api_path}?page=1`;
    const channel_url_resp = await got(channel_url);
    const resp = channel_url_resp.data;
    const list = resp.data.rows;

    const items = await Promise.all(list.filter((item) => item?.url?.startsWith('/a/') || item?.object?.url.startsWith('/a/')).map((item) => utils.parseArticle(item)));

    return {
        title: title.split(' - ').slice(0, 2).join(' - '),
        link: u,
        item: items,
    };
}
