const Twit = require('twit');
const config = require('@/config');
const utils = require('./utils');

const T = new Twit(config.twitter);

module.exports = async (ctx) => {
    const { id, name } = ctx.params;
    const result = await T.get('lists/statuses', {
        owner_screen_name: id,
        slug: name,
        tweet_mode: 'extended',
    });
    const data = result.data;

    ctx.state.data = {
        title: `Twitter List - ${id}/${name}`,
        link: `https://twitter.com/${id}/lists/${name}`,
        item: utils.ProcessFeed({
            data,
        }),
    };
};
