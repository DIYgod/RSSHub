// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? '31';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const rootUrl = 'https://www.right.com.cn';
    const currentUrl = `${rootUrl}/forum/forum-${id}-1.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('a[title="隐藏置顶帖"]').each(function () {
        $(this).parents('tbody').remove();
    });

    let items = $('.s')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}/forum/${item.attr('href')}`,
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

                content('.pstatus').remove();

                item.author = content('.authi').first().text();
                item.description = content('.t_f').first().html();
                item.pubDate = timezone(parseDate(content('.authi em').first().text().replace('发表于 ', '')), +8);
                item.category = content('.ptg a')
                    .toArray()
                    .map((a) => content(a).text());

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('.xs2 a').text()} - 恩山无线论坛`,
        link: currentUrl,
        item: items,
    });
};
