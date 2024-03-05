// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const language = ctx.req.param('language') === 'all' ? 'zh-CN' : ctx.req.param('language') || 'zh-CN';
    const domain = ctx.req.param('domain');
    const filter_locale = ctx.req.param('language') === 'all' ? 0 : 1;
    const sort = ctx.req.param('sort') ?? 'updated';
    const url = domain ? `/by-site/${domain}` : '';
    const currentUrl = `https://greasyfork.org/${language}/scripts${url}`;
    const res = await got({
        method: 'get',
        url: currentUrl,
        searchParams: {
            filter_locale,
            sort,
        },
    });
    const $ = load(res.data);
    const list = $('.script-list').find('article');

    ctx.set('data', {
        title: $('title').first().text(),
        link: currentUrl,
        description: $('meta[name=description]').attr('content'),
        item: list?.toArray().map((item) => {
            item = $(item);
            const h2 = item.find('h2');
            return {
                title: h2.find('a').text(),
                description: h2.find('.description').text(),
                link: new URL(h2.find('a').attr('href'), 'https://greasyfork.org').href,
                pubDate: parseDate(item.find('.script-list-created-date relative-time').attr('datetime')),
                updated: parseDate(item.find('.script-list-updated-date relative-time').attr('datetime')),
                author: item
                    .find('.script-list-author a')
                    .toArray()
                    .map((a) => $(a).text())
                    .join(', '),
            };
        }),
    });
};
