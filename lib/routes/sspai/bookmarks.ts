// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
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
    ctx.set('data', {
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
    });
};
