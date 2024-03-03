// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'jdxw';

    const rootUrl = 'http://www.qm120.com';
    const currentUrl = `${rootUrl}/news/${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.lb2boxls ul li a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
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

                item.description = content('.neirong_body').html();
                item.pubDate = timezone(parseDate(content('.neirong_head p span').eq(1).text()), +8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('.zt_liebiao_tit').text()} - 全民健康网`,
        link: currentUrl,
        item: items,
    });
};
