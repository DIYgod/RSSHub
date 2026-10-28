import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const feedLanguages = new Map<string, Language>([
    // Arabic's valid language tag is absent from the shared Language union.
    ['ar', 'ar' as Language],
    ['de', 'de'],
    ['en', 'en'],
    ['es', 'es'],
    ['fr', 'fr'],
    ['it', 'it'],
    ['ja', 'ja'],
    ['pt', 'pt'],
    ['ru', 'ru'],
    ['zh', 'zh'],
    ['zh-CN', 'zh-CN'],
]);

async function getArticle(link: string): Promise<Partial<DataItem>> {
    const detailResponse = await got({
        method: 'get',
        url: link,
    });

    const content = load(detailResponse.data);

    content('.si-detail__content .si-grid').remove();
    content('.si-detail__content .si-teaser, .article-main .teaser-wide-card').remove();
    content('.show-for-sr, time, address, .si-detail__translation').remove();

    content('.si-detail__content picture').each((_, el) => {
        content(el).html(`<img src="${content(el).find('source').first().attr('srcset')}">`);
    });

    const description = content('.si-detail__content, .article-main').first().html();
    const author = content('meta[name="author"]').attr('content');
    const guid = detailResponse.data.match(/content_id: "(.*)",/)?.[1];

    return { description, author, guid };
}

export const route: Route = {
    path: '/:language?/:category?',
    categories: ['new-media'],
    example: '/swissinfo/eng/latest-news',
    parameters: { language: 'Language, eng by default', category: 'Category, Latest News by default' },
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
            source: ['swissinfo.ch/:language/:category', 'swissinfo.ch/'],
        },
    ],
    name: 'Category',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'eng';
    const category = ctx.req.param('category') ?? 'latest-news';

    const rootUrl = 'https://www.swissinfo.ch';
    const currentUrl = `${rootUrl}/${language}/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let $ = load(response.data);

    const title = $('title').text();
    const feedLanguage = feedLanguages.get($('html').attr('lang') ?? '');

    const fragmentPath = $('main div[data-fragment-placeholder]').attr('data-fragment-placeholder');
    if (fragmentPath) {
        const fragmentResponse = await got({
            method: 'get',
            url: new URL(fragmentPath, rootUrl).href,
        });
        $ = load(fragmentResponse.data);
    }

    const currentTemplate = $('.page-main .teaser-wide-card').length > 0;
    let items = $(currentTemplate ? '.page-main .teaser-wide-card' : '.si-teaser__link')
        .slice(0, getRouteLimit(ctx, 20))
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const date = $item.find(currentTemplate ? 'time' : '.si-teaser__date').attr('datetime');

            return {
                link: new URL(currentTemplate ? $item.find('.teaser-wide-card__link').attr('href')! : $item.attr('href')!, rootUrl).href,
                title: $item.find(currentTemplate ? '.teaser-wide-card__title' : '.si-teaser__title').text(),
                pubDate: date ? parseDate(date) : undefined,
            };
        });

    items = await pMap(items, async (item) => ({ ...item, ...(await cache.tryGet(`swissinfo:article:${item.link}`, () => getArticle(item.link!))) }), { concurrency: 3 });

    return {
        title,
        link: currentUrl,
        language: feedLanguage,
        item: items,
    };
}
