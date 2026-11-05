import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.paradigm.xyz';

export const route: Route = {
    path: '/writing',
    categories: ['finance'],
    example: '/paradigm/writing',
    parameters: {},
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
            source: ['paradigm.xyz/writing'],
        },
    ],
    name: 'Writing',
    maintainers: ['Fatpandac'],
    handler,
    url: 'paradigm.xyz/writing',
};

interface ArticleSchema {
    '@type': string;
    datePublished: string;
    dateModified: string;
    author: Array<{ name: string; url: string }>;
    articleSection: string | string[];
}

async function handler() {
    const url = `${baseUrl}/writing`;
    const response = await got(url);
    const $ = load(response.data);
    const nextText = $('#__NEXT_DATA__').text();
    const nextData = nextText ? JSON.parse(nextText) : undefined;
    const list: Array<DataItem & { link: string; api?: string }> = nextData
        ? nextData.props.pageProps.posts.map((item) => ({
              title: item.title,
              link: `${baseUrl}${item.slug}`,
              api: `${baseUrl}/_next/data/${nextData.buildId}${item.slug}.json`,
              author: item.authors.map((author) => author.name).join(', '),
              pubDate: parseDate(item.originalDate),
              category: item.tags,
          }))
        : $('#all-writing .item-link')
              .toArray()
              .flatMap((element) => {
                  const item = $(element);
                  const href = item.attr('href');
                  return href ? { title: item.find('h2').text(), link: new URL(href, baseUrl).href, image: item.find('img').attr('src') } : [];
              });
    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`paradigm:article:body:${item.link}`, async () => {
                const response = await got(item.api ?? item.link);
                const $ = load(item.api ? response.data.pageProps.content : response.data);
                $('.toc').remove();
                if (item.api) {
                    return { description: $.html() };
                }
                const schema: ArticleSchema | undefined = $('script[type="application/ld+json"]')
                    .toArray()
                    .map((element) => JSON.parse($(element).text()))
                    .find((item) => item['@type'] === 'Article');
                return {
                    description: $('article .story-item__body').html(),
                    author: schema?.author.map((author) => ({ name: author.name, url: author.url })),
                    pubDate: schema?.datePublished ? parseDate(schema.datePublished) : undefined,
                    updated: schema?.dateModified ? parseDate(schema.dateModified) : undefined,
                    category: schema?.articleSection ? [schema.articleSection].flat() : undefined,
                };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );
    return { title: 'Paradigm - Writing', link: url, item: items };
}
