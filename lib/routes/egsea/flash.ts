import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/flash',
    categories: ['new-media'],
    example: '/egsea/flash',
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
            source: ['egsea.com/news/flash'],
        },
    ],
    name: '快讯',
    maintainers: ['hillerliao'],
    handler,
    url: 'egsea.com/news/flash',
};

async function handler() {
    const response = await got({
        method: 'get',
        url: 'https://www.egsea.com/news/flash-list?per-page=30',
    });

    const out = response.data.data.map((item) => {
        const pubDate = parseDate(item.pageTime, 'X');
        const link = 'https://www.egsea.com' + item.url;
        const title = item.title;
        const description = item.content;

        return {
            title,
            link,
            pubDate,
            description,
            category: item.tags.map((tag) => tag.name),
        };
    });

    return {
        title: '快讯 - e 公司',
        link: 'https://www.egsea.com/news/flash',
        item: out,
    };
}
