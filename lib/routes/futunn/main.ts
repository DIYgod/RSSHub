import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';

import { renderDescription } from './templates/description';
import { extractArticleInfo, fetchArticleDetail } from './utils';

export const route: Route = {
    path: ['/main', '/'],
    categories: ['finance'],
    example: '/futunn/main',
    features: {
        supportRadar: true,
        requirePuppeteer: true,
    },
    radar: [
        {
            source: ['news.futunn.com/main', 'news.futunn.com/:lang/main'],
            target: '/main',
        },
    ],
    name: '要闻',
    maintainers: ['Wsine', 'nczitzk', 'kennyfong19931'],
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 48;

    const rootUrl = 'https://news.futunn.com';
    const currentUrl = `${rootUrl}/main`;
    const apiUrl = `${rootUrl}/news-site-api/main/get-market-list?size=${limit}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items = response.data.data.list.map((item) => ({
        title: item.title,
        link: item.url.split('?', 1)[0],
        author: item.source,
        pubDate: parseDate(item.timestamp * 1000),
        description: renderDescription({
            abs: item.abstract,
            pic: item.pic,
        }),
    }));

    const context = await playwright();

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (/news\.futunn\.com/.test(item.link)) {
                    const content = await fetchArticleDetail(context, item.link);

                    const { description, category } = extractArticleInfo(content);

                    item.description = description;
                    item.category = category;
                }

                return item;
            })
        )
    );

    await context.close();

    return {
        title: '富途牛牛 - 要闻',
        link: currentUrl,
        item: items,
    };
}
