import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

type ArticleMetadata = {
    author: {
        name: string;
    };
};
function getArticleMetadata(content: CheerioAPI): ArticleMetadata {
    return JSON.parse(content('script[type="application/ld+json"]:contains("NewsArticle")').text().trim().replace(/;$/, ''));
}
async function getArticleDetails(link: string) {
    const detailResponse = await got({ method: 'get', url: link });
    const content = load(detailResponse.data);
    const tags = content('.sf-item-header-wrapper .sf-tags-list-item')
        .toArray()
        .map((element) => content(element).text());
    const article = getArticleMetadata(content);
    const body = content('.sf-detail-body-wrapper');
    if (!body.length) {
        throw new Error(`WHO article content not found: ${link}`);
    }
    return {
        description: body.html(),
        category: tags.length ? tags : undefined,
        author: article.author.name,
    };
}
export const route: Route = {
    path: '/news/:language?',
    categories: ['government'],
    example: '/who/news',
    parameters: { language: 'Language, see below, English by default' },
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
            source: ['who.int/news'],
            target: '/news',
        },
    ],
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
    url: 'who.int/news',
    description: `Language

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | ---- | -------- | ------- | ------- | --------- |
| en      | ar      | zh   | fr       | ru      | es      | pt        |`,
};
async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'en';
    const rootUrl = 'https://www.who.int';
    const currentUrl = `${rootUrl}/${language === 'en' ? '' : `${language}/`}news`;
    const apiUrl = `${rootUrl}/api/news/newsitems?sf_culture=${language}&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDateAndTime,ItemDefaultUrl`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });
    const list: Array<
        DataItem & {
            link: string;
        }
    > = response.data.value.map((item) => ({
        title: item.Title,
        link: `${currentUrl}/item/${item.ItemDefaultUrl.replace(/^\/+/, '')}`,
        pubDate: parseDate(item.PublicationDateAndTime),
    }));
    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const details = await getArticleDetails(item.link);
                return { ...item, ...details };
            }),
        { concurrency: 3 }
    );
    return {
        title: 'News - WHO',
        link: currentUrl,
        item: items,
    };
}
