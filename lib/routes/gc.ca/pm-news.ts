import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import type { Context } from 'hono';

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
    ],
    name: 'News',
    maintainers: ['elibroftw'],
    handler: async (ctx: Context): Promise<Data> => {
        const { language = 'en' } = ctx.req.param();

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
            .map((element) => {
                const $element = $(element);
                const $titleLink = $element.find('.title a');
                const $category = $element.find('.category');
                const $date = $element.find('.location-date time');

                const title = $titleLink.text().trim();
                const link = $titleLink.attr('href')!;
                const category = $category.text().trim();
                const date = $date.attr('datetime') || '';

                if (title && link) {
                    return {
                        title,
                        link,
                        category: [category],
                        pubDate: date ? parseDate(date) : undefined,
                    } as DataItem;
                }
                return null;
            })
            .filter((item) => item !== null);

        return {
            title: language === 'fr' ? 'Premier ministre du Canada | Nouvelles' : 'Prime Minister of Canada | News',
            link: `https://www.pm.gc.ca/${language}/news`,
            item: items,
        };
    },
};
