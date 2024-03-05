// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const minRating = ctx.req.param('minrating') || 1;

    const rsp = await got.get('https://codeforces.com/api/recentActions?maxCount=100').json();

    const actions = rsp.result.map((action) => {
        const pubDate = new Date(action.timeSeconds * 1000);

        const blog = action.blogEntry;
        const blogId = blog.id;
        const blogTitle = load(blog.title).text();

        if (action.comment) {
            const c = action.comment;
            return {
                title: `@${c.commentatorHandle} commented on "${blogTitle}"`,
                description: load(c.text).text(),
                pubDate,
                link: `https://codeforces.com/blog/entry/${blogId}?#comment-${c.id}`,
                rating: c.rating,
            };
        }
        return {
            title: `@${blog.authorHandle} posted "${blogTitle}"`,
            description: blogTitle,
            pubDate,
            link: `https://codeforces.com/blog/entry/${blogId}`,
            rating: blog.rating,
        };
    });

    ctx.set('data', {
        title: 'Codeforces - Recent actions',
        link: 'https://codeforces.com/recent-actions',
        item: actions
            .filter((a) => a.rating >= minRating)
            .map((a) => ({
                title: a.title,
                description: a.description,
                pubDate: a.pubDate,
                link: a.link,
            })),
    });
};
