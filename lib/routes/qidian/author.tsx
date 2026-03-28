import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

const headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
};

export const route: Route = {
    path: '/author/:id',
    categories: ['reading'],
    example: '/qidian/author/9639927',
    parameters: { id: '作者 id, 可在作者页面 URL 找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['my.qidian.com/author/:id'],
        },
    ],
    name: '作者',
    maintainers: ['miles170', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const currentUrl = `https://my.qidian.com/author/${id}/`;

    // Reason: PC site (my.qidian.com) returns anti-bot JS challenge; mobile site has SSR data
    const response = await got(`https://m.qidian.com/author/${id}/`, { headers });
    const $ = load(response.data);
    const { pageContext } = JSON.parse($('#vite-plugin-ssr_pageContext').text());
    const pageData = pageContext.pageProps.pageData;

    const authorName = pageData.info.name;

    const items = (pageData.allBook || []).map((book) => ({
        title: book.bName,
        author: authorName,
        category: book.cat,
        description: book.desc,
        link: `https://book.qidian.com/info/${book.bid}/`,
    }));

    return {
        title: `${authorName} - 起点中文网`,
        description: pageData.info.desc,
        link: currentUrl,
        item: items,
    };
}
