const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://www.dongqiudi.com/player/${id}.html`;
    const api = `https://www.dongqiudi.com/data/person/archive?person=${id}`;

    await utils.ProcessFeed(ctx, link, api);
};
