import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/articles/:nums?',
    categories: ['government'],
    example: '/meritalk/articles',
    parameters: { nums: 'Page views' },
    description: `It is recommended that the number of nums is less than or equal to 3,
    otherwise it may trigger Cloudflare anti-bot protection.`,
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

async function handler(ctx: Context) {
    const baseUrl = 'https://www.meritalk.com';
    const nums = Number.parseInt(ctx.req.param('nums')) || 1;
    const urls = Array.from({ length: nums }, (_, i) => `${baseUrl}/articles/page/${i + 1}/`);
    const DELAY = 300;

    const lists = await Promise.all(
        urls.map(async (url, index) => {
            await new Promise((resolve) => setTimeout(resolve, index * DELAY));
            try {
                const { data: response } = await got(url);
                const $ = load(response);
                const items: any[] = [];

                $('div.news-block-sm').each((_, item) => {
                    const $item = $(item);
                    const a = $item.find('.news-block-title a');
                    const link = a.attr('href');
                    if (link) {
                        items.push({
                            title: a.text().trim(),
                            link: link,
                            pubDate: parseDate($item.find('time[datetime]').attr('datetime') as string),
                            category: $item
                                .find('.category-header-name a')
                                .toArray()
                                .map((elem) => $(elem).text()),
                            description: '',
                        });
                    }
                });

                return items;
            } catch {
                return [];
            }
        })
    );

    const list = lists.flat();

    let items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const featuredImage = $('.single-featured-image').first().html() || '';
                const fullContent = $('.single-body').first().html() || '';
                item.description = renderDescription({
                    featuredImage,
                    fullContent,
                });

                return item;
            })
        )
    );

    items = items.toSorted((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return {
        title: 'News – MeriTalk',
        link: 'https://www.meritalk.com/articles/',
        item: items,
    };
}
