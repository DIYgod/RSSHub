// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const subpath = ctx.req.param('subpath');
    const base = 'http://international.xjtu.edu.cn';

    const url = `${base}/${subpath.split('.')[0]}.htm`;
    const resp = await got(url);

    const $ = load(resp.data);
    const name = $('div.pageTitle').text();
    const list = $('.news-list-a > .c')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a').attr('title');
            const pubDate = parseDate(item.find('p.list-time').text());
            const link = new URL(item.find('a').attr('href'), base).href;
            return {
                title,
                pubDate,
                link,
            };
        });

    const item = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (new URL(item.link).pathname.startsWith === '/content.jsp') {
                    return item;
                }
                const resp = await got(item.link);

                const $Des = load(resp.data);
                const description = $Des('div.ctnCont').html();

                item.description = description;
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `西安交通大学国际处 - ${name}`,
        link: url,
        description: `西安交通大学国际处 - ${name}`,
        item,
    });
};
