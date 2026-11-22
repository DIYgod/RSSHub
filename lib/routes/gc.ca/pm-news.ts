import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/pm/:language?',
    categories: ['government'],
    example: '/gc.ca/pm/en',
    parameters: { language: 'Language (en or fr)' },
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
            source: ['pm.gc.ca', 'pm.gc.ca/:language', 'pm.gc.ca/:language/news', 'pm.gc.ca/:language/nouvelles'],
            target: '/pm/:language',
        },
        {
            source: ['pm.gc.ca'],
            target: '/pm',
        },
    ],
    name: 'News',
    maintainers: ['elibroftw'],
    handler: async (ctx: Context): Promise<Data> => {
        const { language = 'en' } = ctx.req.param();
        if (language !== 'en' && language !== 'fr') {
            throw new InvalidParameterError('language must be en or fr.');
        }

        const ajaxURL = language === 'fr' ? 'https://www.pm.gc.ca/fr/views/ajax' : 'https://www.pm.gc.ca/views/ajax';

        const response = await ofetch(ajaxURL, {
            method: 'post',
            body: new URLSearchParams({ view_name: 'news', view_display_id: 'page_1', view_args: '', page: '0' }).toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const replaceItem = response.find((item: any) => item.method === 'replaceWith');
        if (!replaceItem) {
            throw new Error('failed to parse AJAX response');
        }

        const $ = load(replaceItem.data);
        const items: DataItem[] = $('.news-row')
            .toArray()
            .map((element): DataItem => {
                const $element = $(element);
                const $titleLink = $element.find('.title a');
                const $category = $element.find('.category');
                const $date = $element.find('.location-date time');

                const category = $category.text().trim();
                const date = $date.attr('datetime') || '';

                return {
                    title: $titleLink.text(),
                    link: $titleLink.attr('href'),
                    category: [category],
                    pubDate: date ? parseDate(date) : undefined,
                };
            });

        return {
            title: language === 'fr' ? 'Premier ministre du Canada | Nouvelles' : 'Prime Minister of Canada | News',
            link: `https://www.pm.gc.ca/${language}/news`,
            language,
            item: items,
        };
    },
};
