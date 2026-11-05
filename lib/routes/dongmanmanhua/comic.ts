import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

    let items = $('#_listUl > li > a')
        .toArray()
        .map((ep) => {
            const title = $('.subj > span', ep).text();
            const link = new URL($(ep).attr('href')!, domain).href;

            return {
                title,
                pubDate: timezone(parseDate($('.date', ep).text().trim(), 'YYYY-M-D'), 8),
                link,
            };
        });
    items = items.toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    const item = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link, async () => {
                const body = await ofetch(item.link);
                const content = load(body);
                const description = content('#_imageList img[data-url]')
                    .toArray()
                    .map((element) => {
                        const image = content(element);
                        image.attr('src', new URL(image.attr('data-url')!, item.link).href);
                        image.removeAttr('data-url rel ondragstart onselectstart oncontextmenu class');
                        return image.toString();
                    })
                    .join('');
                return { ...item, description };
            }),
        { concurrency: 4 }
    );

    return {
        title: `咚漫 - ${$('.detail_header .info .subj').text()}`,
        link: comicLink,
        description: $('p.summary').text(),
        item,
    };
}
