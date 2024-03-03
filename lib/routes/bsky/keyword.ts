// @ts-nocheck
import got from '@/utils/got';

export default async (ctx) => {
    const keyword = ctx.req.param('keyword');
    const apiLink = `https://search.bsky.social/search/posts?q=${encodeURIComponent(keyword)}`;

    const { data } = await got(apiLink);

    const items = data.map((item) => ({
        title: item.post.text,
        link: `https://bsky.app/profile/${item.user.handle}/post/${item.tid.split('/')[1]}`,
        description: item.post.text,
        pubDate: new Date(item.post.createdAt / 1_000_000),
        author: item.user.handle,
    }));

    ctx.set('data', {
        title: `Bluesky Keyword - ${keyword}`,
        link: `https://bsky.app/search?q=${encodeURIComponent(keyword)}`,
        item: items,
    });
};
