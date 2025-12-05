import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/gamedb/recent',
    name: 'Unknown',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { platform = 'all' } = ctx.req.param();
    const baseUrl = 'https://indienova.com';

    const { data: response, url: link } = await got(`${baseUrl}/gamedb/recent/${platform}/p/1`);
    const $ = load(response);

    const list = $('.related-game')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item
                    .find('span')
                    .contents()
                    .filter((_, el) => el.nodeType === 3)
                    .text(),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const featureBox = $('.feature-box');
                if (featureBox.length) {
                    item.description = featureBox.find('p').first().text();
                    return item;
                }

                const article = $('.row article');
                article.find('#showHiddenText').remove();

                item.description = $('.cover-image').prop('outerHTML') + $('.tab-container').html() + article.html();
                item.pubDate = $('.gamedb-release').length ? timezone(parseDate($('.gamedb-release').text().replaceAll(/[()]/g, '')), +8) : null;

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
