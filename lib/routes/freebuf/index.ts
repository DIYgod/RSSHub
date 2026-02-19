import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/articles/:type',
    categories: ['blog'],
    example: '/freebuf/articles/web',
    parameters: { type: '文章类别' },
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
            source: ['freebuf.com/articles/:type/*.html', 'freebuf.com/articles/:type'],
        },
    ],
    name: '文章',
    maintainers: ['trganda'],
    handler,
    description: `::: tip
  Freebuf 的文章页面带有反爬虫机制，所以目前无法获取文章的完整内容。
:::`,
};

async function handler(ctx) {
    const { type = 'web' } = ctx.req.param();

    const fapi = 'https://www.freebuf.com/fapi/frontend/category/list';
    const baseUrl = 'https://www.freebuf.com';
    const rssLink = `${baseUrl}/articles/${type}`;

    const options = {
        headers: {
            referer: 'https://www.freebuf.com',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        },
        query: {
            name: type,
            page: 1,
            limit: 20,
            select: 0,
            order: 0,
            type: 'category',
        },
    };

    const response = await ofetch(fapi, options);

    const items = response.data.data_list.map((item) => ({
        title: item.post_title,
        link: `${baseUrl}${item.url}`,
        description: item.content,
        pubDate: parseDate(item.post_date),
        author: item.nickname,
    }));

    return {
        title: `Freebuf ${type}`,
        link: rssLink,
        item: items,
    };
}
