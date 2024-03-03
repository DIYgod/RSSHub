// @ts-nocheck
const utils = require('./utils');
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const base = utils.langBase(ctx.req.param('lang'));
    const url = `${base}/archive.php`;
    const res = await got.get(url, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const info = utils.fetchAllCharacters(res.data, base);

    ctx.set('data', {
        title: 'Furstar 已出售角色',
        link: 'https://furstar.jp',
        description: 'Furstar 已经出售或预订的角色列表',
        language: ctx.req.param('lang'),
        item: info.map((e) => ({
            title: e.title,
            author: e.author.name,
            description: `<img src="${e.headImage}"/> ${utils.renderAuthor(e.author)}`,
            pubDate: parseDate(new Date().toISOString()), // No Time for now
            link: e.detailPage,
        })),
    });
};
