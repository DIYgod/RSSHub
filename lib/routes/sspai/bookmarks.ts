import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/bookmarks/:slug',
    categories: ['new-media'],
    example: '/sspai/bookmarks/urfp0d9i',
    parameters: { slug: '用户 slug，可在个人主页URL中找到' },
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
            source: ['sspai.com/u/:slug/bookmark_posts'],
        },
    ],
    name: '用户收藏',
    maintainers: ['curly210102'],
    handler,
};

async function handler(ctx) {
    const slug = ctx.req.param('slug');
    const link = `https://sspai.com/u/${slug}/bookmark_posts`;

    const articleList = (
        await got({
            method: 'get',
            url: `https://sspai.com/api/v1/article/user/favorite/public/page/get?limit=10&offset=0&slug=${slug}&type=all`,
            headers: {
                Referer: link,
            },
        })
    ).data.data;

    const user = (
        await got({
            method: 'get',
            url: `https://sspai.com/api/v1/user/slug/info/get?slug=${slug}`,
            headers: {
                Referer: link,
            },
        })
    ).data.data;

    const { nickname } = user;
    return {
        title: `${nickname} 的全部收藏 - 少数派`,
        link,
        description: `少数派用户「${nickname}」的全部收藏`,
        item: articleList.map((article) => ({
            title: article.title,
            description: article.summary,
            link: `https://sspai.com/post/${article.id}`,
            pubDate: parseDate(article.released_time * 1000),
            author: article.author.nickname,
        })),
    };
}
