const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://www.dongqiudi.com/player/${id}.html`;

    await utils.ProcessFeed(ctx, link, 'player');
};
