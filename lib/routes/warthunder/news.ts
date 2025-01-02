import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const renderDescription = (desc) => art(path.join(__dirname, 'templates/description.art'), desc);

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/warthunder/news',
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
            source: ['warthunder.com/en/news', 'warthunder.com/'],
        },
    ],
    name: 'News',
    maintainers: ['axojhf'],
    handler,
    url: 'warthunder.com/en/news',
    description: `News data from [https://warthunder.com/en/news/](https://warthunder.com/en/news/)
  The \`pubDate\` provided under UTC time zone, so please ignore the specific time!!!`,
};

async function handler() {
    const rootUrl = 'https://warthunder.com/en/news/';

    const response = await ofetch(rootUrl);

    const $ = load(response);

    const pageFace = $('div.showcase__item.widget')
        .toArray()
        .map((item) => {
            item = $(item);
            let pubDate = parseDate(item.find('div.widget__content > ul > li.widget-meta__item.widget-meta__item--right').text(), 'D MMMM YYYY', 'en');
            pubDate = timezone(pubDate, 0);
            const category = [];
            if (item.find('div.widget__pin').length !== 0) {
                category.push('pinned');
            }
            if (item.find('a.widget__decal').length !== 0) {
                category.push('decal');
            }
            if (item.find('div.widget__badge').length !== 0) {
                category.push(item.find('div.widget__badge').text());
            }
            return {
                link: `https://warthunder.com${item.find('a.widget__link').attr('href')}`,
                title: item.find('div.widget__content > div.widget__title').text(),
                pubDate,
                description: renderDescription({
                    description: item.find('div.widget__content > div.widget__comment').text(),
                    imglink: item.find('div.widget__poster > img.widget__poster-media').attr('data-src'),
                }),
                category,
            };
        });

    return {
        title: 'War Thunder News',
        link: 'https://warthunder.com/en/news/',
        item: pageFace,
    };
}
