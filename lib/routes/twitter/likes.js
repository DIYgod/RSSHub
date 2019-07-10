const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const result = await utils.getTwit().get('favorites/list', {
        screen_name: id,
        tweet_mode: 'extended',
    });
    const data = result.data;

    ctx.state.data = {
        title: `Twitter Likes - ${id}`,
        link: `https://twitter.com/${id}/likes`,
        item: utils.ProcessFeed({
            data,
        }),
    };
};
