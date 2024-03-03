// @ts-nocheck
import cache from '@/utils/cache';
const utils = require('./utils');
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const base = utils.langBase(ctx.req.param('lang'));
    const res = await got.get(base, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const info = utils.fetchAllCharacters(res.data, base);

    const details = await Promise.all(info.map((e) => utils.detailPage(e.detailPage, cache)));

    ctx.set('json', {
        info,
    });

    ctx.set('data', {
        title: 'Furstar 最新角色',
        link: 'https://furstar.jp',
        description: 'Furstar 最近更新的角色列表',
        language: ctx.req.param('lang'),
        item: info.map((e, i) => ({
            title: e.title,
            author: e.author.name,
            description: utils.renderDesc(details[i].desc, details[i].pics, e.author),
            pubDate: parseDate(new Date().toISOString()), // No Time for now
            link: e.detailPage,
        })),
    });
};
