import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

const regionLanguages = { na: 'en', eu: 'en', fr: 'fr', de: 'de', jp: 'ja' } as const;
const regions = new Set(Object.keys(regionLanguages));
const categories = new Set(['all', 'topics', 'notices', 'maintenance', 'updates', 'status', 'developers']);

export const route: Route = {
    path: '/global/:lang/:type?',
    categories: ['game'],
    example: '/ff14/global/na/all',
    parameters: { lang: 'Region', type: 'Category, `all` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'The Lodestone',
    maintainers: ['kmod-midori'],
    handler,
    description: `Region

| North Ameria | Europe | France | Germany | Japan |
| ------------ | ------ | ------ | ------- | ----- |
| na           | eu     | fr     | de      | jp    |

Category

| all | topics | notices | maintenance | updates | status | developers |
| --- | ------ | ------- | ----------- | ------- | ------ | ---------- |`,
};

interface LodestoneNewsItem {
    id: string;
    url: string;
    title: string;
    time: string;
    description?: string;
    image?: string;
}

async function handler(ctx) {
    const lang = ctx.req.param('lang');
    const type = ctx.req.param('type') ?? 'all';

    if (!regions.has(lang)) {
        throw new InvalidParameterError('Unsupported region. Choose na, eu, fr, de, or jp.');
    }
    if (!categories.has(type)) {
        throw new InvalidParameterError('Unsupported category. Choose all, topics, notices, maintenance, updates, status, or developers.');
    }

    const response = await got({
        method: 'get',
        url: `https://lodestonenews.com/news/${type}?locale=${lang}`,
    });

    let data: LodestoneNewsItem[];
    if (type === 'all') {
        const groups: Record<string, LodestoneNewsItem[]> = response.data;
        data = Object.values(groups).flat();
    } else {
        data = response.data;
    }

    const items = data.map((item) => ({ ...item, pubDate: parseDate(item.time) }));
    const candidates = items;
    const posts = await pMap(
        candidates,
        async ({ id, url, title, pubDate, description, image }) => ({
            title,
            link: url,
            description: description
                ? renderDescription({ image, description })
                : await cache.tryGet(url, async () => {
                      const response = await got(url);
                      const $ = load(response.data);
                      const content = $('.news__detail__wrapper');
                      if (!content.length) {
                          throw new Error('The Lodestone did not provide the article content.');
                      }
                      return content.html();
                  }),
            pubDate,
            guid: id,
        }),
        { concurrency: 3 }
    );

    return {
        title: `FFXIV Lodestone updates (${type})`,
        link: `https://${lang}.finalfantasyxiv.com/lodestone/news/`,
        language: regionLanguages[lang],
        item: posts,
    };
}
