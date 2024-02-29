const { ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    ctx.set('data', await ProcessItems(ctx));
};
