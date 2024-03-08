import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.nogizaka46.com';

export const route: Route = {
    path: '/blog/:id?',
    categories: ['traditional-media'],
    example: '/nogizaka46/blog',
    parameters: { id: 'Member ID, see below, `all` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['blog.nogizaka46.com/s/n46/diary/MEMBER'],
        target: '/blog',
    },
    name: 'Nogizaka46 Blog 乃木坂 46 博客',
    maintainers: ['Kasper4649', 'akashigakki'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'all';
    const params = id === 'all' ? '' : `?ct=${id}`;
    const currentUrl = `${rootUrl}/s/n46/api/list/blog${params}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = JSON.parse(response.data.slice(4).slice(0, -2)).data;

    return {
        allowEmpty: true,
        title: '乃木坂46 公式ブログ',
        link: 'https://www.nogizaka46.com/s/n46/diary/MEMBER',
        item:
            list &&
            list.map((item) => ({
                title: item.title,
                link: item.link,
                pubDate: parseDate(item.date),
                author: item.name,
                description: item.text,
                guid: rootUrl + new URL(item.link).pathname,
            })),
    };
}
