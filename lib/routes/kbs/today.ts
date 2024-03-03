// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const language = ctx.req.param('language') ?? 'e';

    const rootUrl = 'http://world.kbs.co.kr';
    const currentUrl = `${rootUrl}/service/news_today.htm?lang=${language}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.comp_text_1x article')
        .map((_, item) => {
            item = $(item);

            const a = item.find('h2 a');

            return {
                title: a.text(),
                category: item.find('.cate').text(),
                link: `${rootUrl}/service${a.attr('href').replace('./', '/')}`,
                pubDate: timezone(parseDate(item.find('.date').text()), +9),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.body_txt').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `Latest News | KBS WORLD`,
        link: currentUrl,
        item: items,
    });
};
