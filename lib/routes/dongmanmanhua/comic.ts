import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category/:name/:id',
    categories: ['anime'],
    example: '/dongmanmanhua/COMEDY/xin-xinlingdeshengyin/381',
    parameters: { category: '类别', name: '名称', id: 'ID' },
    name: '漫画更新',
    maintainers: ['machsix'],
    handler,
};

const domain = 'https://www.dongmanmanhua.cn';

async function handler(ctx: Context) {
    const { category, name, id } = ctx.req.param();
    const comicLink = `${domain}/${category}/${name}/list?title_no=${id}`;

    const body = await ofetch(comicLink);
    const $ = load(body);

    const item = $('#_listUl > li > a')
        .toArray()
        .map((ep) => {
            const title = $('.subj > span', ep).text();
            const link = new URL($(ep).attr('href')!, domain).href;

            return {
                title,
                pubDate: parseDate($('.date', ep).text()),
                link,
                description: `<a href="${link}" target="_blank">${title}</a>`,
            };
        });

    return {
        title: `咚漫 - ${$('.detail_header .info .subj').text()}`,
        link: comicLink,
        description: $('p.summary').text(),
        item: item.toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime()),
    };
}
