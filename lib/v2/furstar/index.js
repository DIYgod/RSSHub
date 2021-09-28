import utils from './utils.js';
import got from '@/utils/got.js';
import dateParser from '@/utils/dateParser.js';

export default async (ctx) => {
    const base = utils.langBase(ctx.params.lang);
    const res = await got.get(base, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const info = utils.fetchAllCharacters(res.data, base);

    const details = await Promise.all(info.map((e) => utils.detailPage(e.detailPage, ctx.cache)));

    ctx.state.json = {
        info,
    };

    ctx.state.data = {
        title: 'Furstar 最新角色',
        link: 'https://furstar.jp',
        description: 'Furstar 最近更新的角色列表',
        language: ctx.params.lang,
        item: info.map((e, i) => ({
            title: e.title,
            author: e.author.name,
            description: utils.renderDesc(details[i].desc, details[i].pics, e.author),
            pubDate: dateParser(new Date().toISOString()), // No Time for now
            link: e.detailPage,
        })),
    };
};
