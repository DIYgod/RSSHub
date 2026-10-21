import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/free',
    radar: [
        {
            source: ['free.com.tw/'],
        },
    ],
    name: '最新文章',
    maintainers: ['cnkmmk'],
    handler,
    url: 'free.com.tw/',
};

async function handler() {
    const url = 'https://free.com.tw/';
    const response = await ofetch(`${url}feed/`, { responseType: 'text' });
    const feed = await parser.parseString(response);
    const list = feed.items.map((item) => ({ ...item, pubDate: item.pubDate ? parseDate(item.pubDate) : undefined }));
    const items = await pMap(
        list,
        async (item) => {
            if (!item.link || !item.title) {
                throw new Error('Free.com.tw RSS returned an article without a title or link.');
            }
            const description = await cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                const content = $('.entry-content').first();
                content.find('.advads-entity-placement, .google-preferred-cta, script, style').remove();
                content.children('.wp-block-group:has(.wp-block-jetpack-subscriptions)').remove();
                content.find('img[data-src], iframe[data-src]').each((_, element) => {
                    const media = $(element);
                    media.attr('src', media.attr('data-src')!);
                });
                content.find('.perfmatters-lazy-video[data-src]').each((_, element) => {
                    $(element).replaceWith($('<iframe>').attr({ src: $(element).attr('data-src')!, width: '560', height: '315', allowfullscreen: 'true' }));
                });
                if (!content.text()) {
                    throw new Error(`Free.com.tw did not provide article content for ${item.link}.`);
                }
                return content.html() ?? undefined;
            });
            return {
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                author: item.creator,
                category: item.categories,
                description,
            };
        },
        { concurrency: 3 }
    );
    return {
        title: '免費資源網路社群',
        link: url,
        description: '免費資源網路社群 - 全部文章',
        item: items,
    };
}
