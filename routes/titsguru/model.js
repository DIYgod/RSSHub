const { getPage, normalizeKeyword } = require('./util');

module.exports = async (ctx) => {
    const { name } = ctx.params;

    ctx.state.data = await getPage(`https://tits-guru.com/boobs-model/${normalizeKeyword(name)}/date`);
};
