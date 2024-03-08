import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import data from '../data';
import extractor from '../extractor';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/wh/news/:column?',
    categories: ['forecast'],
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
};

async function handler(ctx) {
    const column = ctx.req.param('column') ?? 'xyyw';
    const baseUrl = data.wh.news.url;
    const response = await got(baseUrl + data.wh.news.columns[column].url);
    const $ = load(response.data);
    const items = $('.n_newslist li');
    const out = await Promise.all(
        items.map(async (index, item) => {
            item = $(item);
            const anchor = item.find('a');
            const title = anchor.attr('title');
            const href = anchor.attr('href');
            const link = href.startsWith('http') ? href : baseUrl + href;
            const { description, author, exactDate } = await cache.tryGet(link, () => extractor(link));
            const span = item.find('span');
            const pubDate = exactDate ?? parseDate(span.text(), 'YYYY/MM/DD');
            return {
                title,
                link,
                description,
                pubDate,
                author,
            };
        })
    );

    return {
        title: `${data.wh.news.name} ${data.wh.news.columns[column].name}`,
        link: baseUrl + data.wh.news.columns[column].url,
        item: out,
    };
}
