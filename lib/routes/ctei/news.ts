import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:id?',
    categories: ['new-media'],
    example: '/ctei/news/bwzq',
    parameters: { id: '分类 id，可在分类页的 URL 中找到，默认为本网专区' },
    name: '资讯',
    maintainers: ['nczitzk'],
    description: `| 要闻   | 国内     | 国际     | 企业    | 品牌  | 外贸  | 政策   | 科技       | 流行    | 服装    | 家纺    |
| ------ | -------- | -------- | ------- | ----- | ----- | ------ | ---------- | ------- | ------- | ------- |
| newsyw | domestic | internal | company | brand | trade | policy | Technology | fashion | apparel | hometex |`,
    handler,
};

async function handler(ctx: Context) {
    const { id = 'bwzq' } = ctx.req.param();

    const rootUrl = 'http://news.ctei.cn';
    const currentUrl = `${rootUrl}/${id}`;

    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list: DataItem[] = $('.news_text ul li a')
        .toArray()
        .map((item) => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: `${currentUrl}${$item.attr('href')!.replace(/\./, '')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('.TRS_Editor').html();
                item.pubDate = parseDate(item.link!.match(/\/t(\d{8})_\d+\.htm/)![1], 'YYYYMMDD');

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
