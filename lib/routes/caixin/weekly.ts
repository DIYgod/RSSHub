// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = 'https://weekly.caixin.com';

    const { data: response } = await got(link);
    const $ = load(response);

    const list = [
        ...$('.mi')
            .toArray()
            .map((item) => ({
                link: $(item).find('a').attr('href'),
            })),
        ...$('.xsjCon a')
            .toArray()
            .map((item) => ({
                link: $(item).attr('href'),
            })),
    ].slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = load(data);

                item.title = $('head title')
                    .text()
                    .replace(/_财新周刊频道_财新网$/, '')
                    .trim();
                item.pubDate = parseDate(
                    $('.source')
                        .text()
                        .match(/出版日期：(\d{4}-\d{2}-\d{2})/)[1]
                );

                $('.subscribe').remove();

                const report = $('.report');
                report.find('.title, .source, .date').remove();

                item.description = $('.cover').html() + report.html() + $('.magIntro2').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title')
            .text()
            .replace(/_财新周刊频道_财新网$/, '')
            .trim(),
        link,
        item: items,
    });
};
