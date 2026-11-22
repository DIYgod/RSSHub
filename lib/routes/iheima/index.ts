import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/recommend',
    categories: ['new-media'],
    example: '/iheima/recommend',
    url: 'www.iheima.com',
    name: '推荐',
    maintainers: ['p3psi-boo'],
    handler,
};

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 20);
    const baseUrl = 'https://www.iheima.com';

    const response = await got(baseUrl);
    const $ = load(response.data);

    const items = $('div.item-wrap')
        .slice(0, limit)
        .toArray()
        .map((element) => {
            const $element = $(element);
            const linkElement = $element.find('a.title');
            const image = $element.find('a.pic img').attr('src');
            const brief = $element.find('div.brief').text();
            const pubDate = parseDate($element.find('.time').text());

            return {
                title: linkElement.text(),
                link: linkElement.attr('href') ? new URL(linkElement.attr('href')!, baseUrl).href : undefined,
                pubDate,
                description: `${image ? `<img src="${new URL(image, baseUrl).href}">` : ''}${brief ? `<p>${brief}</p>` : ''}`,
            };
        })
        .filter((item) => item.title && item.link);

    return {
        title: '推荐',
        link: baseUrl,
        item: items,
    };
}
