import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.nogizaka46.com';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/nogizaka46/news',
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
            source: ['news.nogizaka46.com/s/n46/news/list'],
        },
    ],
    name: 'Nogizaka46 News 乃木坂 46 新闻',
    maintainers: ['crispgm', 'Fatpandac'],
    handler,
    url: 'news.nogizaka46.com/s/n46/news/list',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25;

    const response = await got({
        method: 'get',
        url: `${rootUrl}/s/n46/api/list/news`,
        headers: {
            Referer: 'http://www.nogizaka46.com/',
        },
    });

    const data = JSON.parse(response.data.match(/res\((.*)\);/)[1]).data;
    const items = data.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.link_url,
        description: item.text,
        pubDate: parseDate(item.date),
        category: item.cate,
        guid: rootUrl + new URL(item.link_url).pathname,
    }));

    return {
        allowEmpty: true,
        title: '乃木坂46官网 NEWS',
        link: 'http://www.nogizaka46.com/news/',
        item: items,
    };
}
