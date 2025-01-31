import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/changelog/:id',
    categories: ['program-update'],
    example: '/oo-software/changelog/shutup10',
    parameters: { id: 'Software id, see below, shutup10 by default, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Changelog',
    maintainers: ['nczitzk'],
    handler,
    description: `| Software        | Id          |
| --------------- | ----------- |
| O\&O ShutUp10++ | shutup10    |
| O\&O AppBuster  | ooappbuster |
| O\&O Lanytix    | oolanytix   |
| O\&O DeskInfo   | oodeskinfo  |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'shutup10';

    const rootUrl = 'https://www.oo-software.com';
    const currentUrl = `${rootUrl}/en/${id}/changelog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.content h4')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.text();

            return {
                title,
                link: `${currentUrl}#${title.split(' – ')[0]}`,
                description: item.next().html(),
                pubDate: parseDate(title.match(/released (on )?(.*)$/)[2], 'MMMM DD, YYYY'),
            };
        });

    items[0].enclosure_url = $('.banner-inlay').find('a').attr('href');

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
