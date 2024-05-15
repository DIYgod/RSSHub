const { getPage, normalizeKeyword } = require('./util');

module.exports = async (ctx) => {
    const { name } = ctx.params;

    const formalName = normalizeKeyword(name)
        .split('-')
        .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
        .join(' ');

    ctx.state.data = {
        ...(await getPage(`https://tits-guru.com/boobs-model/${normalizeKeyword(name)}/date`)),
        title: `TitsGuru - ${formalName}`,
        description: `TitsGuru - ${formalName}`,
    };
};
