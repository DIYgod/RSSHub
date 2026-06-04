const utils = require('./utils');

module.exports = async (ctx) => {
    const url = `https://letterboxd.com/${ctx.params.username}/following/`;
    const title = `Letterboxd - following diary - ${ctx.params.username}`;

    ctx.state.data = await utils.getFollowingData(ctx, ctx.params.username, url, title);
};
