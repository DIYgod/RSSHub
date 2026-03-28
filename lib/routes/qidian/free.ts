import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

const headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
};

export const route: Route = {
    path: '/free/:type?',
    categories: ['reading'],
    example: '/qidian/free',
    parameters: { type: '默认不填为起点中文网，填 mm 为起点女生网' },
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
            source: ['www.qidian.com/free'],
            target: '/free',
        },
    ],
    name: '限时免费',
    maintainers: ['LogicJake'],
    handler,
    url: 'www.qidian.com/free',
};

async function handler(ctx) {
    const type = ctx.req.param('type');

    const isMM = type === 'mm';
    const link = isMM ? 'https://www.qidian.com/mm/free' : 'https://www.qidian.com/free';
    const title = isMM ? '起点女生网' : '起点中文网';

    // Reason: PC site (www.qidian.com) returns anti-bot JS challenge; mobile site has SSR data
    const response = await got('https://m.qidian.com/free', { headers });
    const $ = load(response.data);
    const { pageContext } = JSON.parse($('#vite-plugin-ssr_pageContext').text());
    const pageData = pageContext.pageProps.pageData;

    const items = (pageData.curFree || []).map((book) => ({
        title: book.bName,
        link: `https://book.qidian.com/info/${book.bid}/`,
        author: book.bAuth,
        description: `评分：${book.score === -1 ? '暂无' : book.score}`,
    }));

    return {
        title,
        description: `限时免费-${title}`,
        link,
        item: items,
    };
}
