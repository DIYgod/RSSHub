import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/panewslab/news',
    radar: [
        {
            source: ['panewslab.com/'],
        },
    ],
    name: '快讯',
    maintainers: ['nczitzk'],
    handler,
    url: 'panewslab.com/',
};

async function handler(ctx) {
    const rootUrl = 'https://panewslab.com';
    const apiUrl = `${rootUrl}/webapi/flashnews?LId=1&Rn=${ctx.req.query('limit') ?? 50}&tw=0`;
    const currentUrl = `${rootUrl}/zh/news/index.html`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.data.flashNews[0].list.map((item) => ({
        title: item.title,
        author: item.author.name,
        pubDate: parseDate(item.publishTime * 1000),
        link: `${rootUrl}/zh/articledetails/${item.id}.html`,
        description: `<p>${item.desc.replaceAll('\r\n原文链接', '')}</p>`,
        category: item.tags,
    }));

    return {
        title: 'PANews - 快讯',
        link: currentUrl,
        item: items,
    };
}
