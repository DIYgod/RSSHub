import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?/:language?/:keyword?',
    categories: ['new-media'],
    example: '/consumer',
    parameters: { category: '分类，见下表，默认为測試及調查', language: '语言，见下表，默认为繁体中文', keyword: '关键字，默认为空' },
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
            source: ['consumer.org.hk/'],
        },
    ],
    name: '文章',
    maintainers: ['nczitzk'],
    handler,
    url: 'consumer.org.hk/',
    description: `分类

| 测试及调查 | 生活资讯 | 投诉实录  | 议题评论 |
| ---------- | -------- | --------- | -------- |
| test       | life     | complaint | topic    |

  语言

| 简体中文 | 繁体中文 |
| -------- | -------- |
| sc       | tc       |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'test';
    const language = ctx.req.param('language') ?? 'tc';
    const keyword = ctx.req.param('keyword') ?? '';

    const rootUrl = 'https://www.consumer.org.hk';
    const currentUrl = `${rootUrl}/${language}/free-article/free-article-${category}?category=free-article-${category}&q=${keyword}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.half-img-blk__title, .img-plate-blk__title')
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: parseDate(item.parent().prev().find('li').first().text(), 'YYYY.MM'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.ckec').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
