import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const cateList = new Set(['all', 'design-resources', 'learn-design', 'inside-eagle', 'why-eagle']);
const languages: Record<string, Data['language']> = { cn: 'zh-CN', tw: 'zh-TW', en: 'en', jp: 'ja', kr: 'ko', es: 'es', de: 'de', ru: 'ru' };

export const route: Route = {
    path: '/blog/:cate?/:language?',
    categories: ['blog'],
    example: '/eagle/blog/en',
    parameters: {
        cate: 'Category, get by URL, `all` by default',
        language: {
            description: 'Language',
            options: [
                { value: 'cn', label: 'cn' },
                { value: 'tw', label: 'tw' },
                { value: 'en', label: 'en' },
                { value: 'jp', label: 'jp' },
                { value: 'kr', label: 'kr' },
                { value: 'es', label: 'es' },
                { value: 'de', label: 'de' },
                { value: 'ru', label: 'ru' },
            ],
            default: 'cn',
        },
    },
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
            source: ['cn.eagle.cool/blog'],
            target: '/blog',
        },
        ...['cn', 'tw', 'en'].flatMap((language) => [
            ...['design-resources', 'learn-design', 'inside-eagle', 'why-eagle'].map((category) => ({
                source: [`${language}.eagle.cool/blog/${category}`],
                target: `/blog/${category}/${language}`,
            })),
            ...(language === 'cn' ? [] : [{ source: [`${language}.eagle.cool/blog`], target: `/blog/all/${language}` }]),
        ]),
    ],
    name: 'Blog',
    maintainers: ['Fatpandac'],
    handler,
    url: 'cn.eagle.cool/blog',
};

async function handler(ctx): Promise<Data> {
    let cate = ctx.req.param('cate') ?? 'all';
    let language = ctx.req.param('language') ?? 'cn';
    if (!cateList.has(cate)) {
        if (!Object.hasOwn(languages, cate)) {
            throw new InvalidParameterError(`Invalid category or language: ${cate}. Categories: ${[...cateList].join(', ')}. Languages: ${Object.keys(languages).join(', ')}.`);
        }
        language = cate;
        cate = 'all';
    }
    if (!Object.hasOwn(languages, language)) {
        throw new InvalidParameterError(`Invalid language: ${language}. Choose from ${Object.keys(languages).join(', ')}.`);
    }

    const host = `https://${language}.eagle.cool`;
    const url = `${host}/blog/${cate === 'all' ? '' : cate}`;

    const response = await got(url);
    const $ = load(response.data);
    const title = $('title').text();
    const list = $('div[class*="__blog-card__link"]')
        .toArray()
        .map((item): DataItem & { link: string } => ({
            title: $(item).find('h3[class*="__blog-card__title"]').text(),
            link: new URL($(item).find('a').attr('href')!, host).href,
            author: $(item).find('span[class*="__blog-card__author-name"]').text(),
            category: [$(item).find('a[class*="__blog-card__category"]').text()],
        }));
    const candidates = list;
    const items = await pMap(
        candidates,
        (item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);

                const content = load(detailResponse.data);
                const body = content('div[class*="__blog-post__content"]');
                if (!body.length) {
                    throw new Error(`The Eagle article body was not found at ${item.link}. Please check the original page.`);
                }
                item.description = body.html();
                const published = content('meta[property="article:published_time"]').attr('content');
                const modified = content('meta[property="article:modified_time"]').attr('content');
                item.pubDate = published ? parseDate(published) : undefined;
                item.updated = modified ? parseDate(modified) : undefined;
                item.author = content('meta[property="article:author"]').attr('content') ?? item.author;
                const section = content('meta[property="article:section"]').attr('content');
                item.category = section ? [section] : item.category;

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title,
        link: url,
        language: languages[language],
        item: items,
    };
}
