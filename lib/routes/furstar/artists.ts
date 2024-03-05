// @ts-nocheck
const utils = require('./utils');
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const base = utils.langBase(ctx.req.param('lang'));
    const res = await got.get(base, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = load(res.data);
    const artists = $('.filter-item')
        .map((i, e) => utils.authorDetail(e))
        .get();
    artists.shift(); // the first one is "show all"

    ctx.set('data', {
        title: 'furstar 所有画家',
        link: 'https://furstar.jp',
        description: 'Furstar 所有画家列表',
        language: ctx.req.param('lang'),
        item: artists.map((e) => ({
            title: e.name,
            author: e.name,
            description: `<img src="${e.avatar}"/><a href="${base}/${e.link}">${e.name}</a>`,
            pubDate: parseDate(new Date().toISOString()), // No Time for now
            link: `${base}/${e.link}`,
        })),
    });
};
