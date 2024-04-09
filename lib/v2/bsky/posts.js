const { parseDate } = require('@/utils/parse-date');
const { resolveHandle, getProfile, getAuthorFeed } = require('./utils');
const { art } = require('@/utils/render');
const { join } = require('path');

module.exports = async (ctx) => {
    const { handle } = ctx.params;
    const DID = await resolveHandle(handle, ctx.cache.tryGet);
    const profile = await getProfile(DID, ctx.cache.tryGet);
    const authorFeed = await getAuthorFeed(DID, ctx.cache.tryGet);

    const items = authorFeed.feed.map(({ post }) => ({
        title: post.record.text.split('\n')[0],
        description: art(join(__dirname, 'templates/post.art'), {
            text: post.record.text.replace(/\n/g, '<br>'),
            embed: post.embed,
            // embed.$type "app.bsky.embed.record#view" and "app.bsky.embed.recordWithMedia#view"
            // are not handled
        }),
        author: post.author.displayName,
        pubDate: parseDate(post.record.createdAt),
        link: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('app.bsky.feed.post/')[1]}`,
        upvotes: post.likeCount,
        comments: post.replyCount,
    }));

    ctx.state.data = {
        title: `${profile.displayName} (@${profile.handle}) — Bluesky`,
        description: profile.description.replace(/\n/g, ' '),
        link: `https://bsky.app/profile/${profile.handle}`,
        image: profile.banner,
        icon: profile.avatar,
        logo: profile.avatar,
        item: items,
    };

    ctx.state.json = {
        DID,
        profile,
        authorFeed,
    };
};
