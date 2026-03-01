import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/articles',
    categories: ['government'],
    example: '/meritalk/articles',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    // radar: {
    //     source: ['github.com/:user/:repo/issues', 'github.com/:user/:repo/issues/:id', 'github.com/:user/:repo'],
    //     target: '/issue/:user/:repo',
    // },
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
                throw new Error('The link might have changed.');
            }
            return {
                title: a.text().trim(),
                link: link,
                pubDate: parseDate($item.find('time[datetime]').attr('datetime') as string),
                category: $item
                    .find('.category-header-name a')
                    .toArray()
                    .map((elem) => $(elem).text()),
                description: '',
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const featuredImage = $('.single-featured-image').first().html() || '';
                const fullContent = $('.single-body').first().html();
                item.description = featuredImage + fullContent;

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
