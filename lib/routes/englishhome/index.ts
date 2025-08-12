import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/englishhome',
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
            source: ['englishhome.org/'],
        },
    ],
    name: '首頁',
    maintainers: ['johan456789'],
    handler,
    description: '英語之家 - The Home of English 首頁',
};

async function handler() {
    const rootUrl = 'https://englishhome.org';
    const currentUrl = `${rootUrl}/`;

    const response = await got(currentUrl);
    const $ = load(response.data);

    const items = $('#content article')
        .toArray()
        .map((item) => {
            const el = $(item);
            const titleEl = el.find('.entry-header > h2.entry-title a');
            const title = titleEl.text().trim();
            const link = new URL(titleEl.attr('href') ?? '', rootUrl).href;
            const description = el.find('div.entry-content').html() ?? '';
            const datetimeAttr = el.find('.entry-header time.published').attr('datetime')?.trim();
            const pubDate = parseDate(datetimeAttr ?? '');

            return {
                title,
                link,
                description,
                pubDate,
            };
        });

    return {
        title: '英語之家 - The Home of English',
        link: currentUrl,
        item: items,
    };
}
