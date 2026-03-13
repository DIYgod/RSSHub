import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hanlab/blog',
    categories: ['blog'],
    example: '/mit/hanlab/blog',
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
            source: ['hanlab.mit.edu/blog'],
        },
    ],
    name: 'HAN Lab Blog',
    maintainers: ['johan456789'],
    handler,
    description: 'MIT HAN Lab pioneers research in efficient AI, advancing algorithms and hardware to make generative models faster, smarter, and more accessible.',
};

async function handler() {
    const rootUrl = 'https://hanlab.mit.edu';
    const currentUrl = `${rootUrl}/blog`;

    const response = await got(currentUrl);
    const $ = load(response.data);

    const items = $('a.post-card-wrapper')
        .toArray()
        .map((item) => {
            const el = $(item);
            const titleEl = el.find('h3.text-title');
            const title = titleEl.text().trim();
            const link = new URL(el.attr('href') ?? '', rootUrl).href;
            const description = el.find('p.text-tldr').html() ?? undefined;
            const dateText = el.find('div.text-date').text().trim();
            const pubDate = parseDate(dateText);

            return {
                title,
                link,
                description,
                pubDate,
            };
        });

    return {
        title: 'MIT HAN Lab Blog',
        link: currentUrl,
        item: items,
    };
}
