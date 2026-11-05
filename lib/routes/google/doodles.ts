import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/doodles/:language?',
    categories: ['picture'],
    view: ViewType.Pictures,
    example: '/google/doodles/zh-CN',
    parameters: { language: 'No longer used, [Google Doodles](https://doodles.google/) is only served in English now. Kept so existing feed URLs keep working' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Update',
    maintainers: ['xyqfer'],
    handler,
};

async function handler() {
    // google.com/doodles and its monthly JSON moved to doodles.google, which has no JSON API and is English only, so read the latest doodles from its home page
    const link = 'https://doodles.google/';
    const response = await ofetch(link);
    const $ = load(response);

    return {
        title: 'Google Doodles',
        link,
        item: $('.doodle-card')
            .toArray()
            .map((card) => {
                const $card = $(card);
                const image = $card.find('.doodle-card-img img').attr('src');

                return {
                    title: $card.find('.doodle-card-content__event').text().trim(),
                    description: image ? `<img src="https:${image}" />` : undefined,
                    pubDate: parseDate($card.find('.doodle-card-content__date').text().trim(), 'MMM DD, YYYY'),
                    guid: image,
                    link: new URL($card.find('a').attr('href') ?? '', link).href,
                };
            }),
    };
}
