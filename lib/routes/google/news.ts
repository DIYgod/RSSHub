import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const baseUrl = 'https://news.google.com';

export const route: Route = {
    path: '/news/:category/:locale',
    categories: ['new-media', 'popular'],
    example: '/google/news/Top stories/hl=en-US&gl=US&ceid=US:en',
    parameters: { category: 'Category Title', locale: 'locales, could be found behind `?`, including `hl`, `gl`, and `ceid` as parameters' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['zoenglinghou', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const locale = ctx.req.param('locale');

    const categoryUrls = await cache.tryGet(`google:news:${locale}`, async () => {
        const front_data = await ofetch(`${baseUrl}/?${locale}`);

        const $ = load(front_data);
        return [
            ...$('a.brSCsc')
                .toArray()
                .slice(3) // skip Home, For you and Following
                .map((item) => {
                    item = $(item);
                    return {
                        category: item.text(),
                        url: new URL(item.attr('href'), baseUrl).href,
                    };
                }),
            ...$('a.aqvwYd') // Home
                .toArray()
                .map((item) => {
                    item = $(item);
                    return {
                        category: item.text(),
                        url: new URL(item.attr('href'), baseUrl).href,
                    };
                }),
        ];
    });
    const categoryUrl = categoryUrls.find((item) => item.category === category).url;

    const data = await ofetch(categoryUrl);
    const $ = load(data);

    const list = [...$('.UwIKyb'), ...$('.IBr9hb'), ...$('.IFHyqb')]; // 3 rows of news, 3-rows-wide news, single row news

    const items = list.map((item) => {
        item = $(item);

        const title = item.find('.gPFEn').text();

        const authorText = item.find('.bInasb span').text();
        const authors = authorText
            ? authorText
                  .replace(/^By\s+/i, '') // Handle 'By' case-insensitively
                  .replaceAll(/\s+\([^)]*\)/g, '') // Remove parenthetical info like (She/Her)
                  .split(/,|\s+&\s+|\s+and\s+/) // Split on comma, &, and 'and'
                  .map((author) => author.trim())
                  .filter((author) => {
                      // Filter out empty strings and common suffixes
                      if (!author) {
                          return false;
                      }
                      const suffixes = ['et al', 'et al.'];
                      return !suffixes.some((suffix) => author.toLowerCase().endsWith(suffix));
                  })
                  .map((author) => ({ name: author }))
            : [];

        return {
            title,
            description: art(path.join(__dirname, 'templates/news.art'), {
                img: item.find('img.Quavad').attr('src'),
                brief: title,
            }),
            pubDate: parseDate(item.find('time').attr('datetime')),
            author: authors,
            link: new URL(item.find('a.WwrzSb').first().attr('href'), baseUrl).href,
        };
    });

    return {
        title: $('title').text(),
        link: categoryUrl,
        item: items,
    };
}
