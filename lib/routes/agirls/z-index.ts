import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { baseUrl, parseArticle } from './utils';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media', 'popular'],
    example: '/agirls/app',
    parameters: { category: '分类，默认为最新文章，可在对应主题页的 URL 中找到，下表仅列出部分' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['agirls.aotter.net/posts/:category'],
            target: '/:category',
        },
    ],
    name: '分类',
    maintainers: ['TonyRL'],
    handler,
    description: `| App 评测 | 手机开箱 | 笔电开箱 | 3C 周边     | 教学小技巧 | 科技情报 |
| -------- | -------- | -------- | ----------- | ---------- | -------- |
| app      | phone    | computer | accessories | tutorial   | techlife |`,
};

async function handler(ctx) {
    const { category = '' } = ctx.req.param();
    const link = `${baseUrl}/posts${category ? `/${category}` : ''}`;
    const response = await got(link);

    const $ = load(response.data);

    const list = $('.ag-post-item__link')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text().trim(),
                link: `${baseUrl}${item.attr('href')}`,
            };
        });

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseArticle(item))));

    return {
        title: $('head title').text().trim(),
        link,
        description: $('head meta[name=description]').attr('content'),
        item: items,
        language: $('html').attr('lang'),
    };
}
