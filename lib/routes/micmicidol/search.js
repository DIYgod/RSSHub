const parse = require('./parse');

module.exports = (ctx) => {
    const { label, max = 10 } = ctx.params;
    return parse(ctx, `search/label/${label}?max-results=${max}`, label);
};
