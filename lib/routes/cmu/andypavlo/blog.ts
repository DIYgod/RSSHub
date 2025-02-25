import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

async function getArticles() {
    const url = 'https://www.cs.cmu.edu/~pavlo/blog/index.html';
    const { data: res } = await got(url);
    const $ = load(res);

    const list = $('.row.mb-3')
        .toArray()
        .map((element) => {
            const $item = $(element);
            const $title = $item.find('h4 a');
            const $date = $item.find('.text-muted');
            const $description = $item.find('p');

            return {
                title: $title.text().trim(),
                link: $title.attr('href'),
                description: $description.text().trim(),
                pubDate: parseDate($date.attr('title')),
                guid: $title.attr('href'),
            };
        });
    return list;
}

export const route: Route = {
    path: '/andypavlo/blog',
    categories: ['blog'],
    example: '/cmu/andypavlo/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Andy Pavlo Blog',
    maintainers: ['mocusez'],
    handler,
};

async function handler() {
    const articles = await getArticles();
    return {
        title: 'Andy Pavlo - Carnegie Mellon University',
        link: 'https://www.cs.cmu.edu/~pavlo/blog/index.html',
        item: articles,
    };
}
