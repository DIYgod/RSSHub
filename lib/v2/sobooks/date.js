const utils = require('./utils');

module.exports = async (ctx) => {
    const date = ctx.req.param('date') ?? `${new Date().getFullYear()}/${new Date().getMonth()}`;

    ctx.set('data', await utils(ctx, `books/date/${date.replace('-', '/')}`));
};
