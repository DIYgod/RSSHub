const { parseDate } = require('@/utils/parse-date');
const { getAccountByUsername, getTimelineByAccountId, parseDescription, baseUrl } = require('./utils');

module.exports = async (ctx) => {
    const { username } = ctx.params;

    const account = await getAccountByUsername(username, ctx.cache.tryGet);
    const timeline = await getTimelineByAccountId(account.id);

    const items = timeline.posts.map((post) => ({
        title: post.content.split('\n')[0],
        description: parseDescription(post, timeline),
        pubDate: parseDate(post.createdAt, 'X'),
        link: `${baseUrl}/post/${post.id}`,
        author: `${account.displayName ?? account.username} (@${account.username})`,
    }));

    ctx.state.data = {
        title: `${account.displayName ?? account.username} (@${account.username}) - Fansly`,
        link: `${baseUrl}/${account.username}`,
        description: account.about.replaceAll('\n', ' '),
        image: account.banner.locations[0].location,
        icon: account.avatar.locations[0].location,
        logo: account.avatar.locations[0].location,
        language: 'en',
        allowEmpty: true,
        item: items,
    };
};
