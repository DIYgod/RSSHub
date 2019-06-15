const utils = require('./utils');

module.exports = async (ctx) => {
    const { id, name } = ctx.params;
    const result = await utils.getTwit().get('lists/statuses', {
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
