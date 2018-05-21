const Twit = require('twit');
const config = require('../../config');

const T = new Twit(config.twitter);

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const result = await T.get('statuses/user_timeline', {
        screen_name: id,
    });

    const data = result.data;

    ctx.state.data = {
        title: `${data[0].user.name} 的 Twitter`,
        link: `https://twitter.com/${id}/`,
        description: data[0].user.description,
        item: data.map((item) => {
            let img = '';
            item.extended_entities &&
                item.extended_entities.media.forEach((item) => {
                    img += `<br>${item.type === 'video' ? 'Video: ' : ''}<img referrerpolicy="no-referrer" src="${item.media_url_https}">`;
                });
            return {
                title: `${item.in_reply_to_screen_name ? 'Re ' : ''}${item.text.length > 30 ? item.text.slice(0, 30) + '...' : item.text}`,
                description: `${item.in_reply_to_screen_name ? 'Re ' : ''}${item.text}${img}`,
                pubDate: new Date(item.created_at).toUTCString(),
                link: `https://twitter.com/${id}/status/${item.id_str}`,
            };
        }),
    };
};
