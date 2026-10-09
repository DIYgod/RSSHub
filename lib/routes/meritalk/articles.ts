import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/articles',
    categories: ['new-media'],
    example: '/meritalk/articles',
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
            source: ['meritalk.com/articles/'],
            target: '/articles',
        },
    ],
    name: 'Latest Articles',
    maintainers: ['superguyDiluc'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.meritalk.com/articles';

    const { data: response } = await got(baseUrl);
    const $ = load(response);

    const list = $('div.news-block-sm')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.news-block-title a');
            const link = a.attr('href');
            if (!link) {
                return null;
            }
            const datetime = $item.find('time[datetime]').attr('datetime');
            return {
                title: a.text(),
                link,
                pubDate: datetime ? parseDate(datetime) : undefined,
                category: $item
                    .find('.category-header-name a')
                    .toArray()
                    .map((elem) => $(elem).text()),
                description: '',
            };
        })
        .filter((item) => item !== null);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const featuredImage = $('.single-featured-image').html() || '';
                const fullContent = $('.single-body').html() || '';
                item!.description = renderDescription({
                    featuredImage,
                    fullContent,
                });

                return item;
            })
        )
    );

    return {
        title: 'News – MeriTalk',
        link: 'https://www.meritalk.com/articles/',
        item: items,
    };
}
