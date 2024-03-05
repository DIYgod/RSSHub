// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { baseUrl, cookieJar } = require('./utils');

export default async (ctx) => {
    const response = await got(`${baseUrl}/siteindex`, { cookieJar });
    const $ = load(response.data);

    let items = $('li[class^="grid mq640-grid-12"]')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('href').replaceAll('/', ''),
                name: item.find('a').text(),
                link: baseUrl + item.find('a').attr('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(`nature:siteindex:${item.title}`, async () => {
                const response = await got(item.link, { cookieJar });
                const $ = load(response.data);

                delete item.link;
                try {
                    item.id = $('.app-latest-issue-row__image img')
                        .attr('src')
                        .match(/.*\/journal\/(\d{5})/)[1];
                    item.description = item.id;
                } catch {
                    //
                }
                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'Nature siteindex',
        link: response.url,
        item: items,
    });
    ctx.set('json', {
        items,
    });
};
