const Twit = require('twit');
const config = require('../../config');

const T = new Twit(config.twitter);

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const result = await T.get('statuses/user_timeline', {
        screen_name: id,
        tweet_mode: 'extended',
    });

    const data = result.data;

    ctx.state.data = {
        title: `${data[0].user.name} 的 Twitter`,
        link: `https://twitter.com/${id}/`,
        description: data[0].user.description,
        item: data.map((item) => {
            item = item.retweeted_status || item;
            item.full_text = item.full_text.replace(/https:\/\/t\.co(.*)/g, '');
            let img = '';
            item.extended_entities &&
                item.extended_entities.media.forEach((item) => {
                    img += `<br>${item.type === 'video' ? 'Video: ' : ''}<img referrerpolicy="no-referrer" src="${item.media_url_https}">`;
                });
            let url = '';
            item.entities.urls.forEach((u) => {
                url += `<a href="${u.expanded_url}" target="_blank">${u.expanded_url}</a>`;
            });
            return {
                title: `${item.in_reply_to_screen_name ? 'Re ' : ''}${item.full_text}`,
                description: `${item.in_reply_to_screen_name ? 'Re ' : ''}${item.full_text}${url}${img}`,
                pubDate: new Date(item.created_at).toUTCString(),
                link: `https://twitter.com/${id}/status/${item.id_str}`,
            };
        }),
    };
};
