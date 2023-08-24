const config = require('@/config').value;
const got = require('@/utils/got');

module.exports = async (ctx) => {
    if (!config.discourse.config[ctx.params.configId]) {
        throw Error('Discourse RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install">relevant config</a>');
    }
    const { link, key } = config.discourse.config[ctx.params.configId];

    const response = await got(`${link}/notifications.json`, { headers: { 'User-Api-Key': key } }).json();
    const items = response.notifications.map((e) => ({
        title: e.fancy_title ?? e.data.badge_name,
        link: `${link}/${e.data.hasOwnProperty('badge_id') ? `badges/${e.data.badge_id}/${e.data.badge_slug}?username=${e.data.username}` : `${e.topic_id}/${e.post_number}`}`,
        pubDate: new Date(e.created_at),
        author: e.data.display_username ?? e.data.username,
        category: `notification_type:${e.notification_type}`,
    }));

    ctx.state.data = { item: items };
};
