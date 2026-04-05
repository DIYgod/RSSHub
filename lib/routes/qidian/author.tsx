import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { PRESETS } from '@/utils/header-generator';

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
    const response = await got(`https://m.qidian.com/author/${id}/`, { headerGeneratorOptions: PRESETS.MODERN_IOS });
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
