import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import data from '../data';
import extractor from '../extractor';

export const route: Route = {
    path: '/wh/news/:column?',
    categories: ['university'],
    example: '/sdu/wh/news/xyyw',
    parameters: { column: '专栏名称，默认为校园要闻（`xyyw`）' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻网',
    maintainers: ['kxxt'],
    handler,
    description: `| 校园要闻 | 学生动态 | 综合新闻 | 山大视点 | 菁菁校园 | 校园简讯 | 玛珈之窗 | 热点专题 | 媒体视角 | 高教视野 | 理论学习 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| xyyw     | xsdt     | zhxw     | sdsd     | jjxy     | xyjx     | mjzc     | rdzt     | mtsj     | gjsy     | llxx     |`,
};

type ExtractedArticle = {
    description?: string | null;
    author?: string;
    exactDate?: Date;
};

async function handler(ctx) {
    const column = ctx.req.param('column') ?? 'xyyw';
    const baseUrl = data.wh.news.url;
    const response = await got(baseUrl + data.wh.news.columns[column].url);
    const $ = load(response.data);
    const items = $('.n_newslist li');
    const out = await pMap(
        items.toArray(),
        async (item, _index) => {
            const $item = $(item);
            const anchor = $item.find('a');
            const title = anchor.attr('title');
            const href = anchor.attr('href');
            const link = href!.startsWith('http') ? href : baseUrl + href;
            const { description, author, exactDate } = await cache.tryGet<ExtractedArticle>(`sdu:wh-news:article-v3:${link}`, () => extractor(link));
            const span = $item.find('span');
            const pubDate = exactDate ?? timezone(parseDate(span.text(), 'YYYY/MM/DD'), 8);
            return {
                title: title!,
                link,
                description,
                pubDate,
                author,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: `${data.wh.news.name} ${data.wh.news.columns[column].name}`,
        link: baseUrl + data.wh.news.columns[column].url,
        item: out,
    };
}
