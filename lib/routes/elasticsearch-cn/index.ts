import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:params?',
    categories: ['bbs'],
    example: '/elasticsearch-cn',
    parameters: { params: '分类，可在对应分类页 URL 中找到' },
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
            source: ['elasticsearch.cn/:params', 'elasticsearch.cn/'],
            target: '/:params',
        },
    ],
    name: '发现',
    maintainers: ['nczitzk'],
    handler,
    description: `如 [Elasticsearch 最新](https://elasticsearch.cn/category-2) 的 URL 为 \`https://elasticsearch.cn/category-2\`，则分类参数处填写 \`category-2\`，最后得到路由地址 [\`/elasticsearch-cn/category-2\`](https://rsshub.app/elasticsearch-cn/category-2)。

又如 [求职招聘 30 天热门](https://elasticsearch.cn/sort_type-hot____category-12__day-30) 的 URL 为 \`https://elasticsearch.cn/sort_type-hot____category-12__day-30\`，则分类参数处填写 \`sort_type-hot____category-12__day-30\`，最后得到路由地址 [\`/elasticsearch-cn/sort_type-hot____category-12__day-30\`](https://rsshub.app/elasticsearch-cn/sort_type-hot____category-12__day-30)。`,
};

async function handler(ctx) {
    const params = ctx.req.param('params') ?? '';

    const rootUrl = 'https://elasticsearch.cn';
    const currentUrl = `${rootUrl}${params ? `/${params}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.aw-question-content')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const a = $item.find('h4 a');
            const pubDate = $item.find('span.text-color-999').not('.pull-right').first().text().split('•').pop()!.trim();

            return {
                title: a.text(),
                link: a.attr('href'),
                author: $item.find('.aw-user-name').text(),
                pubDate: pubDate ? (/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(pubDate) ? timezone(parseDate(pubDate), 8) : parseRelativeDate(pubDate)) : undefined,
            };
        });

    items = await pMap(
        items,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`elasticsearch-cn:content:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const article = content('.markitup-box').first();
                const category = article
                    .find('.aw-topic-bar a.text')
                    .toArray()
                    .map((element) => content(element).text().trim());
                article.find('.aw-topic-bar').remove();
                return { description: article.html() ?? undefined, category };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
