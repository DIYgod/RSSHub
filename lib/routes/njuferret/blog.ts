import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/njuferret/blog',
    parameters: { user: 'Github.io blog name' },
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
            source: ['njuferret.github.io'],
        },
    ],
    name: 'Blogs',
    maintainers: [],
    handler,
};

async function handler() {
    const promises = [];
    let pageUrl;
    const baseUrl = 'https://njuferret.github.io';
    for (let page = 1; page <= 7; page++) {
        pageUrl = page === 1 ? baseUrl : `${baseUrl}/page/${page}`;
        promises.push(ofetch(pageUrl));
    }

    const responses = await Promise.all(promises);
    let items = [];
    for (const response of responses) {
        const $ = load(response);

        const pageItem = $('div.post-block')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').first();
                return {
                    title: a.text(),
                    link: `${baseUrl}${a.attr('href')}`,
                    pubDate: parseDate(item.find('time').attr('datetime')),
                };
            });
        items = items.concat(pageItem);
    }

    return {
        title: 'njuferret - blog',
        // link: baseUrl,
        item: items,
    };
}
