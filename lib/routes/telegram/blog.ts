import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['social-media'],
    view: ViewType.Articles,
    example: '/telegram/blog',
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
            source: ['telegram.org/blog'],
        },
    ],
    name: 'Telegram Blog',
    maintainers: ['fengkx'],
    handler,
    url: 'telegram.org/blog',
};

async function handler() {
    const link = 'https://telegram.org/blog';

    const res = await ofetch(link);
    const $$ = cheerio.load(res);

    const items = await Promise.all(
        $$('.dev_blog_card_link_wrap')
            .toArray()
            .map((each) => {
                const $ = $$(each);
                const link = 'https://telegram.org' + $.attr('href');
                return cache.tryGet(link, async () => {
                    const result = await ofetch(link);
                    const $ = cheerio.load(result);
                    return {
                        title: $('#dev_page_title').text(),
                        link,
                        pubDate: parseDate($('[property="article:published_time"]').attr('content')),
                        description: $('#dev_page_content_wrap').html(),
                    };
                });
            })
    );

    return {
        title: $$('title').text(),
        link,
        item: items,
    };
}
