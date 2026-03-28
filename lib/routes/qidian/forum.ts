import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

const headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
};

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
    maintainers: ['fuzy112'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    // Reason: forum.qidian.com redirects and PC site has anti-bot JS challenge;
    // mobile book page embeds forum posts via seoBookCirclePost
    const response = await got(`https://m.qidian.com/book/${id}.html`, { headers });
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
