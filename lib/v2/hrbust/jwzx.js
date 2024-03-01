const got = require('@/utils/got');
const utils = require('./utils');

const typeMap = {
    351: {
        name: '名师风采',
    },
    353: {
        name: '热点新闻',
    },
    354: {
        name: '教务公告',
    },
    355: {
        name: '教学新闻',
    },
};

module.exports = async (ctx) => {
    const page = ctx.params.page || '12';
    const base = utils.columnIdBase(ctx.params.type) + '&pagingNumberPer=' + page;
    const res = await got(base);
    const info = utils.fetchAllArticle(res.data, utils.JWZXBASE);

    const details = await Promise.all(info.map((e) => utils.detailPage(e, ctx.cache)));

    // ctx.state.json = {
    //     info,
    // };

    ctx.state.data = {
        title: '哈理工教务处' + typeMap[ctx.params.type || 354].name,
        link: base,
        item: details,
    };
};
