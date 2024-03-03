// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
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

export default async (ctx) => {
    const page = ctx.req.param('page') || '12';
    const base = utils.columnIdBase(ctx.req.param('type')) + '&pagingNumberPer=' + page;
    const res = await got(base);
    const info = utils.fetchAllArticle(res.data, utils.JWZXBASE);

    const details = await Promise.all(info.map((e) => utils.detailPage(e, cache)));

    // ctx.set('json', {
    //     info,
    // };

    ctx.set('data', {
        title: '哈理工教务处' + typeMap[ctx.req.param('type') || 354].name,
        link: base,
        item: details,
    });
};
