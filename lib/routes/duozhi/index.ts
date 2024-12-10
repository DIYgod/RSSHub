import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/industry/insight',
    categories: ['new-media'],
    example: '/duozhi/industry/insight/',
    url: 'www.duozhi.com/industry/insight/',
    name: '行业洞察',
    maintainers: ['p3psi-boo'],
    handler,
};

async function handler() {
    const baseUrl = 'http://www.duozhi.com';
    const response = await got({
        method: 'get',
        url: `${baseUrl}/industry/insight/`,
    });

    const $ = load(response.data);
    const list = $('.post-item')
        .toArray()
        .map((_, item) => {
            const $item = $(item);
            const $link = $item.find('.post-title').first();
            const $desc = $item.find('.post-desc').first();
            const $author = $item.find('.post-attr').first();
            const $date = $item.find('.post-attr').last();

            return {
                title: $link.text().trim(),
                link: new URL($link.attr('href') || '', baseUrl).href,
                description: $desc.text().trim(),
                author: $author.text().trim().split('&nbsp;&nbsp;')[0],
                pubDate: parseDate($date.text().split('|')[0].trim()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(response.data);
                item.description = $('.subject-content').html() || item.description;
                return item;
            })
        )
    );

    return {
        title: '多知网 - 行业洞察',
        link: `${baseUrl}/industry/insight/`,
        item: items,
    };
}
