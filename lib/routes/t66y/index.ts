import * as cheerio from 'cheerio';
import got from '@/utils/got';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { baseUrl, parseContent } from './utils';

export default async (ctx) => {
    const { id, type } = ctx.req.param();

    const url = new URL(`thread0806.php?fid=${id}&search=today`, baseUrl);
    type && url.searchParams.set('type', type);

    const { data: res } = await got(url);
    const $ = cheerio.load(res);
    const list = $('#ajaxtable > tbody:nth-child(2) .tr3')
        .not('.tr2.tac')
        .toArray()
        .map((item) => {
            const element = $(item);

            const tal = element.find('.tal');
            const catalog = tal
                .contents()
                .filter((_, node) => node.type === 'text')
                .text()
                .trim();
            const a = tal.find('h3 a');
            const td3 = element.find('td:nth-child(3)');

            return {
                title: `${catalog} ${a.text()}`,
                link: `${baseUrl}/${a.attr('href')}`,
                author: td3.find('a').text(),
                pubDate: parseDate(String(td3.find('span[data-timestamp]').data('timestamp')).slice(0, -1), 'X'),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);

                item.description = parseContent(response);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: (type ? `[${$('.t .fn b').text()}]` : '') + $('head title').text(),
        link: url.href,
        item: out,
    });
};
