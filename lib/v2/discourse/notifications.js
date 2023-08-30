const { getConfig } = require('./utils');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { link, key } = getConfig(ctx);

    const response = await got(`${link}/notifications.json`, { headers: { 'User-Api-Key': key } }).json();
    const items = response.notifications.map((e) => ({
        title: e.fancy_title ?? e.data.badge_name,
        link: `${link}/${e.data.hasOwnProperty('badge_id') ? `badges/${e.data.badge_id}/${e.data.badge_slug}?username=${e.data.username}` : `t/topic/${e.topic_id}/${e.post_number}`}`,
        pubDate: new Date(e.created_at),
        author: e.data.display_username ?? e.data.username,
        category: `notification_type:${e.notification_type}`,
    }));

    const { about } = await got(`${link}/about.json`, { headers: { 'User-Api-Key': key } }).json();
    ctx.state.data = {
        title: `${about.title} - Notifications`,
        description: about.description,
        item: items,
    };
};
