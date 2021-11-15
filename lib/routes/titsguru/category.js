const { getPage, normalizeKeyword } = require('./util');

export default async (ctx) => {
    const { type } = ctx.params;

    ctx.state.data = await getPage(`https://tits-guru.com/category/${normalizeKeyword(type)}/date`);
};
