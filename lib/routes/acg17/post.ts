import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const host = 'http://acg17.com';

export const route: Route = {
    path: '/post/all',
    categories: ['anime'],
    example: '/acg17/post/all',
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
            source: ['acg17.com/post'],
        },
    ],
    name: '全部文章',
    maintainers: ['SunBK201'],
    handler,
    url: 'acg17.com/post',
};

async function handler() {
    const response = await got(`${host}/wp-json/wp/v2/posts?per_page=30`);
    const list = response.data;
    return {
        title: `ACG17 - 全部文章`,
        link: `${host}/blog`,
        description: 'ACG17 - 全部文章',
        item: list.map((item) => ({
            title: item.title.rendered,
            link: item.link,
            pubDate: parseDate(item.date_gmt),
            description: item.content.rendered,
        })),
    };
}
