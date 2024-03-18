import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/whats-new',
    categories: ['program-update'],
    example: '/diskanalyzer/whats-new',
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
            source: ['diskanalyzer.com/whats-new', 'diskanalyzer.com/'],
        },
    ],
    name: "What's New",
    maintainers: ['nczitzk'],
    handler,
    url: 'diskanalyzer.com/whats-new',
};

async function handler() {
    const rootUrl = 'https://diskanalyzer.com';
    const currentUrl = `${rootUrl}/whats-new`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.blog-content h4')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.text();

            let description = '';
            item.nextUntil('h4').each(function () {
                description += $(this).html();
            });
            if (description === '') {
                item.parent()
                    .nextUntil('h4')
                    .each(function () {
                        description += $(this).html();
                    });
            }

            return {
                title,
                link: currentUrl,
                description,
                pubDate: parseDate(title.match(/\((.*)\)/)[1], ['D MMMM YYYY', 'D MMM YYYY']),
                guid: title,
            };
        });

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
