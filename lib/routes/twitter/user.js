const Twit = require('twit');
const config = require('../../config');
const utils = require('./utils');

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
        item: utils.ProcessFeed({
            data,
        }),
    };
};
