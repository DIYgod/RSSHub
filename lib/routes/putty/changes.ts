import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/changes',
    categories: ['program-update'],
    example: '/putty/changes',
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
            source: ['www.chiark.greenend.org.uk/~sgtatham/putty/changes.html', 'www.chiark.greenend.org.uk/'],
        },
    ],
    name: 'Change Log',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.chiark.greenend.org.uk/~sgtatham/putty/changes.html',
};

async function handler() {
    const rootUrl = 'https://www.chiark.greenend.org.uk';
    const currentUrl = `${rootUrl}/~sgtatham/putty/changes.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data.replaceAll('href="releases', 'class="version" href="releases'));

    const items = $('.version')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.parent().text().split('in').pop();

            return {
                title,
                link: `${rootUrl}/~sgtatham/putty/${item.attr('href')}`,
                description: item.parent().next().html(),
                pubDate: parseDate(title.match(/\(released (.*)\)/)[1]),
            };
        });

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
