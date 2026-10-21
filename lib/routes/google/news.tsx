import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://news.google.com';

const getPublisherUrl = (metadata: string | undefined, fallback: string) => {
    const encoded = metadata?.match(/(?:^|;)\s*5:\s*([^;]+)/)?.[1];
    if (!encoded) {
        return fallback;
    }
    try {
        const values: unknown = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
        if (Array.isArray(values)) {
            const url = values.find((value) => typeof value === 'string' && /^https?:\/\//.test(value));
            if (url && new URL(url).hostname !== 'news.google.com') {
                return url as string;
            }
        }
    } catch {
        // Google may change click metadata; preserve the working News link.
    }
    return fallback;
};

export const route: Route = {
    path: '/news/:category/:locale',
    categories: ['new-media'],
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
        const frontData = await ofetch(`${baseUrl}/?${locale}`);

        const $ = load(frontData);
        return [
            ...$('a.brSCsc')
                .slice(3) // skip Home, For you and Following
                .toArray()
                .map((item) => {
                    const $item = $(item);
                    return {
                        category: $item.text(),
                        url: new URL($item.attr('href')!, baseUrl).href,
                    };
                }),
            ...$('a.aqvwYd') // Home
                .toArray()
                .map((item) => {
                    const $item = $(item);
                    return {
                        category: $item.text(),
                        url: new URL($item.attr('href')!, baseUrl).href,
                    };
                }),
        ];
    });
    const selectedCategory = categoryUrls.find((item) => item.category === category || (category === 'Top stories' && item.category === 'Home'));
    if (!selectedCategory) {
        throw new InvalidParameterError(`Unknown Google News category "${category}". Available categories: ${categoryUrls.map((item) => item.category).join(', ')}.`);
    }
    const categoryUrl = selectedCategory.url;

    const data = await ofetch(categoryUrl);
    const $ = load(data);

    const list = [...$('.UwIKyb'), ...$('.IBr9hb'), ...$('.IFHyqb')]; // 3 rows of news, 3-rows-wide news, single row news

    const items = list.map((item) => {
        const $item = $(item);

        const title = $item.find('.gPFEn').text();
        const anchor = $item.find('a.WwrzSb').first();
        const newsUrl = new URL(anchor.attr('href')!, baseUrl).href;
        const timestamp = $item.find('time').attr('datetime');
        const publicationDate = timestamp ? parseDate(timestamp) : undefined;

        const authorText = $item.find('.bInasb span').text();
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
                      return suffixes.every((suffix) => !author.toLowerCase().endsWith(suffix));
                  })
                  .map((author) => ({ name: author }))
            : [];

        return {
            title,
            description: renderDescription($item.find('img.Quavad').attr('src')),
            pubDate: publicationDate && !Number.isNaN(publicationDate.getTime()) ? publicationDate : undefined,
            author: authors,
            link: getPublisherUrl(anchor.attr('jslog'), newsUrl),
            guid: newsUrl,
        };
    });

    return {
        title: $('title').text(),
        link: categoryUrl,
        item: items,
    };
}

const renderDescription = (img: string | undefined): string | undefined =>
    img
        ? renderToString(
              <>
                  <img src={img} />
                  <br />
              </>
          )
        : undefined;
