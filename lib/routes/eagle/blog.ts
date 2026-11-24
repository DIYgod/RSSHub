import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

const cateList = new Set(['all', 'thoughts', 'guides', 'design-resources', 'inside-eagle', 'product-news', 'learn-design', 'why-eagle']);
const languages = { cn: 'zh-CN', tw: 'zh-TW', en: 'en', jp: 'ja', kr: 'ko', es: 'es', de: 'de', ru: 'ru' } satisfies Record<string, Language>;

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
            ...['thoughts', 'guides', 'design-resources', 'inside-eagle', 'product-news'].map((category) => ({
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
    const list = $('.post-card')
        .toArray()
        .map((item): DataItem & { link: string } => ({
            title: $(item).find('.post-card__title').text(),
            link: new URL($(item).find('a').attr('href')!, host).href,
            category: [$(item).find('.post-card__tag').text()],
        }));
    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);

                const content = load(detailResponse.data);
                item.description = content('.article-content').html();
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content')!);

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
