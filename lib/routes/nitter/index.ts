import parser from '@/utils/rss-parser';

export default async (ctx) => {
    const username = ctx.params.username;
    const url = `https://nitter.poast.org/${username}/rss`;
    ctx.redirect(url);
};
