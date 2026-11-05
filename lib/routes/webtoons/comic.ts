import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/:lang/:category/:name/:id',
    categories: ['anime'],
    example: '/webtoons/zh-hant/drama/gongzhuweimian/894',
    parameters: { lang: 'Language', category: 'Category', name: 'Name', id: 'ID' },
    name: 'Comic updates',
    maintainers: ['machsix'],
    handler,
    description: 'For example: `https://www.webtoons.com/zh-hant/drama/gongzhuweimian/list?title_no=894`, `lang=zh-hant`,`category=drama`,`name=gongzhucheyeweimian`,`id=894`.',
};

const domain = 'https://www.webtoons.com';

async function handler(ctx: Context) {
    const { lang, category, name, id } = ctx.req.param();
    const comicLink = `${domain}/${lang}/${category}/${name}/list?title_no=${id}`;
    const rssLink = `${domain}/${lang}/${category}/${name}/rss?title_no=${id}`;

    let rss;
    try {
        const body = await parser.parseURL(rssLink);
        rss = {
            title: `Webtoons - ${body.title}`,
            link: comicLink,
            description: body.description,
            item: body.items.map((x) => {
                const date = x.pubDate ? parseDate(x.pubDate) : undefined;
                return {
                    title: x.title,
                    pubDate: date && Number.isFinite(date.getTime()) ? date : undefined,
                    link: x.link,
                    description: x.content,
                };
            }),
        };
    } catch {
        const body = await ofetch(comicLink);
        const $ = load(body);
        rss = {
            title: `Webtoons - ${$('.detail_header .info .subj').text()}`,
            link: comicLink,
            description: $('p.summary').text(),
            item: $('#_listUl > li > a')
                .toArray()
                .map((ep) => {
                    const dateText = $('.date', ep).text();
                    const date = dateText ? (lang === 'zh-cn' || lang === 'zh-hant' ? parseDate(dateText, 'YYYY年M月D日', true) : parseDate(dateText)) : undefined;
                    return {
                        title: $('.subj > span', ep).text(),
                        pubDate: date && Number.isFinite(date.getTime()) ? date : undefined,
                        link: $(ep).attr('href'),
                        description: $('.thmb', ep).html() ?? undefined,
                    };
                }),
        };
    }

    return rss;
}
