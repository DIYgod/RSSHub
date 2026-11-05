import { escape } from 'entities/escape';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
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

interface SourceArticle {
    id: number;
    slug?: string;
    title: string;
    summary: string;
    released_time: number;
    author: { nickname: string };
}

async function handler(ctx) {
    const slug = ctx.req.param('slug');
    const link = `https://sspai.com/u/${slug}/bookmark_posts`;

    const articleList: SourceArticle[] = (
        await got({
            method: 'get',
            url: `https://sspai.com/api/v1/article/user/favorite/public/page/get?limit=10&offset=0&slug=${slug}&type=all`,
            headers: {
                Referer: link,
            },
        })
    ).data.data;

    const { nickname } = (
        await got({
            method: 'get',
            url: `https://sspai.com/api/v1/user/slug/info/get?slug=${slug}`,
            headers: {
                Referer: link,
            },
        })
    ).data.data;
    return {
        title: `${nickname} 的全部收藏 - 少数派`,
        link,
        description: `少数派用户「${nickname}」的全部收藏`,
        item: await pMap(
            articleList,
            async (article) => {
                const details = await cache.tryGet(`sspai:bookmarks:body:v1:${article.id}`, async () => {
                    const url = `https://sspai.com/api/v1/${article.slug ? `member/article/single/info/get?slug=${article.slug}` : `article/info/get?id=${article.id}`}&view=second&support_webp=true`;
                    const response = await got(url);
                    const data = response.data.data;
                    const banner = data.promote_image ? `<img src="${data.promote_image}">` : '';
                    const sections = data.body_extends?.map((section) => `<h2>${escape(section.title)}</h2>${section.body}`).join('') ?? '';
                    return { description: banner + sections + (data.body ?? '') || undefined };
                });
                return {
                    title: article.title,
                    description: details.description ?? article.summary,
                    link: `https://sspai.com/post/${article.id}`,
                    pubDate: article.released_time ? parseDate(article.released_time * 1000) : undefined,
                    author: article.author.nickname,
                };
            },
            { concurrency: 3 }
        ),
    };
}
