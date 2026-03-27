import 'dayjs/locale/fr.js';

import type { Cheerio } from 'cheerio';
import { load } from 'cheerio';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

dayjs.extend(localizedFormat);

export const route: Route = {
    path: '/:language?',
    categories: ['travel'],
    example: '/altotrain/en',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['altotrain.ca/:language', 'altotrain.ca/:language/news', 'altotrain.ca/:language/nouvelles'],
            target: '/:language',
        },
    ],
    name: 'Alto News',
    maintainers: ['elibroftw'],
    handler: async (ctx: Context): Promise<Data> => {
        const { language = 'en' } = ctx.req.param();
        const link = language === 'fr' ? 'https://www.altotrain.ca/fr/nouvelles' : 'https://www.altotrain.ca/en/news';
        const response = await ofetch(link);

        const $ = load(response);

        const featuredPost = $('body > div:first-of-type > main > div:nth-of-type(2) > div:nth-of-type(2) > div > div:first-of-type > div > a').first();
        const featuredItems: DataItem[] = featuredPost.length
            ? (() => {
                  const featuredItem = extractItem(featuredPost, language);
                  return [featuredItem];
              })()
            : [];

        const posts = $('.tw-grid > div.tw-flex.tw-flex-col')
            .toArray()
            .map((el) => {
                const a = $(el).find('a').first();
                return extractItem(a, language);
            });

        return {
            title: 'Alto News',
            link,
            item: [...featuredItems, ...posts],
        };
    },
};

function extractItem(a: Cheerio<any>, language: string) {
    const href = a.attr('href');

    const titleEl = a.find('h2, h3').first();
    const title = titleEl.text().trim();

    const descEl = a.find('p').first();
    const description = descEl.text().trim();

    const dateMatch = language === 'fr' ? description.match(/(\d{1,2} [a-zéû]+[.]? \d{4})/i) : description.match(/([A-Z][a-z]+[.]? \d{1,2}, \d{4})/);

    const pubDateStr = dateMatch ? dateMatch[1].trim() : '';
    const pubDate = parseDate(pubDateStr);

    const imgEl = a.find('img').first();
    const src = imgEl.attr('src');
    const image = src ? new URL(src, 'https://www.altotrain.ca').href : undefined;

    return {
        title,
        link: href!,
        pubDate,
        author: 'Alto',
        category: ['News'],
        description,
        id: href!,
        image,
    };
}
