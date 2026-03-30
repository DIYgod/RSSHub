import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { PRESETS } from '@/utils/header-generator';

export const route: Route = {
    path: '/forum/:id',
    categories: ['reading'],
    example: '/qidian/forum/1010400217',
    parameters: { id: '小说 id, 可在对应小说页 URL 中找到' },
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
            source: ['book.qidian.com/info/:id'],
        },
    ],
    name: '讨论区',
    maintainers: ['fuzy112', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    // Reason: forum.qidian.com redirects and PC site has anti-bot JS challenge;
    // mobile book page embeds forum posts via seoBookCirclePost
    const response = await got(`https://m.qidian.com/book/${id}.html`, { headerGeneratorOptions: PRESETS.MODERN_IOS });
    const $ = load(response.data);
    const { pageContext } = JSON.parse($('#vite-plugin-ssr_pageContext').text());
    const pageData = pageContext.pageProps.pageData;

    const bookName = pageData.bookInfo?.bookName || '';
    const posts = pageData.seoBookCirclePost?.bookCirclePostList || [];

    const items = posts.map((post) => ({
        title: post.title,
        link: `https://book.qidian.com/info/${id}/`,
        description: post.circleReviewDesc,
        author: post.userName,
    }));

    return {
        title: `起点 《${bookName}》讨论区`,
        link: `https://book.qidian.com/info/${id}/`,
        item: items,
    };
}
