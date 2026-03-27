import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';
import { apiTopicUrl, processItems, rootUrl } from './util';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/readhub',
    parameters: { category: '分类，见下表，默认为热门话题' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['WhiteWorld', 'nczitzk', 'Fatpandac'],
    handler,
    description: `| 热门话题 | 科技动态 | 医疗产业 | 财经快讯           |
| -------- | -------- | -------- | ------------------ |
|          | news     | medical  | financial_express |`,
};

async function handler(ctx) {
    const { category = '' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const currentUrl = new URL(category ?? '', rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const type = currentResponse.match(/\[\\"type\\",\\"(\d+)\\",\\"d\\"]/)?.[1] ?? '1';

    const { data: response } = await got(apiTopicUrl, {
        searchParams: {
            type,
            page: 1,
            size: limit,
        },
    });

    let items = response.data.items.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.url ?? new URL(`topic/${item.uid}`, rootUrl).href,
        description: renderDescription({
            description: item.summary,
            news: item.newsAggList,
            timeline: item.timeline,
            rootUrl,
        }),
        author: item.siteNameDisplay,
        category: [...(item.entityList.map((c) => c.name) ?? []), ...(item.tagList.map((c) => c.name) ?? [])],
        guid: item.uid,
        pubDate: parseDate(item.publishDate),
    }));

    items = await processItems(items, cache.tryGet);

    const $ = load(currentResponse);

    const author = $('meta[property="og:site_name"]').prop('content');
    const subtitle = $(`a[data-path="/${category}"]`).text();
    const image = $('link[rel="preload"][as="image"]').prop('href');
    const icon = $('meta[property="og:image"]').prop('content');

    return {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle,
        author,
        allowEmpty: true,
    };
}
