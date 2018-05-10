const template = require('../../utils/template');
const Twit = require('twit');
const config = require('../../config');

const T = new Twit(config.twitter);

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const result = await T.get('statuses/user_timeline', {
        screen_name: id
    });

    const data = result.data;

    ctx.body = template({
        title: `${data[0].user.name} 的 Twitter`,
        link: `https://twitter.com/${id}/`,
        description: data[0].user.description,
        item: data.map((item) => ({
            title: `${item.in_reply_to_screen_name ? 'Re ' : ''}${item.text.length > 30 ? item.text.slice(0, 30) + '...' : item.text}`,
            description: `${item.in_reply_to_screen_name ? 'Re ' : ''}${item.text}`,
            pubDate: new Date(item.createdTime).toUTCString(),
            link: `https://twitter.com/${id}/status/${item.id_str}`
        })),
    });
};