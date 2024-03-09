const parse = require('./parse');

module.exports = (ctx) => {
    const max = ctx.query.limit || 50;
    const { label } = ctx.params;
    return parse(ctx, `search/label/${label}?max-results=${max}`, label);
};
