// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'Recent';

    const rootUrl = 'https://getquicker.net';
    const currentUrl = `${rootUrl}/Share/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('table tbody tr')
        .slice(1, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25)
        .toArray()
        .map((item) => {
            item = $(item).find('td a').first();

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('section').last().remove();
                content('#app').children().slice(0, 2).remove();

                const pubDate = content('.text-secondary a').not('.text-secondary').first().text()?.trim().replaceAll(/\s*/g, '') || content('div.note-text').find('span').eq(3).text();

                item.author = content('.user-link').first().text();
                item.description = content('div[data-info="动作信息"]').html() ?? content('#app').html() ?? content('.row').eq(1).html();
                item.pubDate = timezone(/-/.test(pubDate) ? parseDate(pubDate) : parseRelativeDate(pubDate), +8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
    });
};
