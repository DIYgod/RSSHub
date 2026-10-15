import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/archive',
    categories: ['blog'],
    example: '/luxiangdong/archive',
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
            source: ['luxiangdong.com/'],
        },
    ],
    name: '文章',
    maintainers: ['Levix'],
    handler,
    url: 'luxiangdong.com/',
};

async function handler() {
    const { data } = await got(`https://www.luxiangdong.com/content.json?t=${Date.now()}`);

    const items = data.posts.map((item) => ({
        // Article title
        title: item.title,
        // Article link
        link: item.permalink,
        // Article publication date
        pubDate: parseDate(item.date),
        // Article author, when available
        author: data.meta.author,
        // Article categories, when available
        category: item.tags.map((tag) => tag.name),
    }));

    return {
        // Feed title
        title: '土猛的员外',
        // Feed link
        link: 'https://www.luxiangdong.com/',
        // Feed entries
        item: items,
    };
}
