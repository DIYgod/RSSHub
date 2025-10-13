const { getConfig } = require('./utils');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { link, key } = getConfig(ctx);

    const response = await got(`${link}/notifications.json`, { headers: { 'User-Api-Key': key } }).json();
    let items = response.notifications.slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 10).map((e) => ({
        title: e.fancy_title ?? e.data.badge_name,
        link: `${link}/${e.data.hasOwnProperty('badge_id') ? `badges/${e.data.badge_id}/${e.data.badge_slug}?username=${e.data.username}` : `t/topic/${e.topic_id}/${e.post_number}`}`,
        pubDate: new Date(e.created_at),
        author: e.data.display_username ?? e.data.username,
        category: `notification_type:${e.notification_type}`,
        original_post_id: e.data.original_post_id,
    }));

    if (ctx.params.fulltext === '1') {
        items = await Promise.all(
            items.map((e) => {
                if (e.original_post_id) {
                    const post_link = `${link}/posts/${e.original_post_id}.json`;
                    return ctx.cache.tryGet(post_link, async () => {
                        const { cooked } = await got(post_link, { headers: { 'User-Api-Key': key } }).json();
                        return { ...e, description: cooked };
                    });
                } else {
                    return e;
                }
            })
        );
    }

    const { about } = await got(`${link}/about.json`, { headers: { 'User-Api-Key': key } }).json();
    ctx.state.data = {
        title: `${about.title} - Notifications`,
        description: about.description,
        item: items,
    };
};
