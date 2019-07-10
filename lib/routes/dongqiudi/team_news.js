const utils = require('./utils');

module.exports = async (ctx) => {
    const team = ctx.params.team;
    const link = `https://www.dongqiudi.com/team/${team}.html`;
    const api = `https://www.dongqiudi.com/data/team/archive?team=${team}`;

    await utils.ProcessFeed(ctx, link, api);
};
