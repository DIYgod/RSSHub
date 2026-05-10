import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    view: ViewType.Articles,
    example: '/techflowpost',
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
            source: ['techflowpost.com'],
        },
    ],
    name: '\u9996\u9875',
    maintainers: ['subwukong'],
    handler,
    url: 'techflowpost.com',
};

async function handler() {
    const rssUrl = 'https://techflowpost.com/api/client/common/rss.xml';
    const response = await got(rssUrl);
    const $ = load(response.data, { xmlMode: true });

    const items = $('item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('title').text().trim();
            const link = $item.find('link').text().trim();
            const description = $item.find('description').text().trim();
            const pubDate = $item.find('pubDate').text().trim();

            return {
                title,
                link,
                description,
                pubDate: parseDate(pubDate),
            };
        });

    return {
        title: 'TechFlow \u79d1\u6280\u6d41\u52a8',
        link: 'https://techflowpost.com',
        description: 'TechFlow \u79d1\u6280\u6d41\u52a8\uff0c\u805a\u7126\u533a\u5757\u94fe\u3001Web3\u3001AI \u7b49\u9886\u57df\u7684\u6df1\u5ea6\u8d44\u8baf',
        item: items,
    };
}
