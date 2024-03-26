import { Route } from '@/types';
import cache from '@/utils/cache';
import * as cheerio from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['social-media'],
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

    const res = await got(link);
    const $$ = cheerio.load(res.body);

    const items = await Promise.all(
        $$('.dev_blog_card_link_wrap')
            .get()
            .map((each) => {
                const $ = $$(each);
                const link = 'https://telegram.org' + $.attr('href');
                return cache.tryGet(link, async () => {
                    const result = await got(link);
                    const $ = cheerio.load(result.body);
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
