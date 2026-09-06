import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/weekly',
    categories: ['traditional-media'],
    example: '/caixin/weekly',
    radar: [
        {
            source: ['weekly.caixin.com/', 'weekly.caixin.com/*'],
        },
    ],
    name: '财新周刊',
    maintainers: ['TonyRL'],
    handler,
    url: 'weekly.caixin.com/',
};

async function handler(ctx) {
    const link = 'https://weekly.caixin.com';

    const { data: response } = await got(link);
    const $ = load(response);

    const list = [
        ...$('.mi')
            .toArray()
            .map((item) => ({
                link: $(item).find('a').attr('href')?.replace('http:', 'https:'),
            })),
        ...$('.xsjCon a')
            .toArray()
            .map((item) => ({
                link: $(item).attr('href'),
            })),
    ].slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 10);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet<DataItem>(item.link!, async () => {
                const { data } = await got(item.link);
                const $ = load(data);

                const title = $('head title')
                    .text()
                    .replace(/_财新周刊频道_财新网$/, '')
                    .trim();
                const pubDate = parseDate(
                    $('.source')
                        .text()
                        .match(/出版日期：(\d{4}-\d{2}-\d{2})/)![1]
                );

                $('.subscribe').remove();

                const report = $('.report');
                report.find('.title, .source, .date').remove();

                const description = $('.cover').html()! + report.html()! + $('.magIntro2').html();

                return { title, pubDate, description, link: item.link };
            })
        )
    );

    return {
        title: $('head title')
            .text()
            .replace(/_财新周刊频道_财新网$/, '')
            .trim(),
        link,
        item: items,
    };
}
