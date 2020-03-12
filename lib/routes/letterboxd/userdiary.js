const utils = require('./utils');

module.exports = async (ctx) => {
    const url = `https://letterboxd.com/${ctx.params.username}/films/diary/by/added/`;
    const title = `Letterboxd - diary - ${ctx.params.username}`;

    ctx.state.data = await utils.getData(ctx, ctx.params.username, url, title);
};
