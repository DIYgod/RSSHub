// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'http://hrss.xz.gov.cn';
    const currentUrl = `${rootUrl}${category ? `/001/${category}/subPage.html` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = (category ? $('.module-items a') : $('.bdl[data-target="1"]').eq(1).find('a')).toArray().map((item) => {
        item = $(item);

        const link = item.attr('href');

        return {
            title: item.attr('title'),
            link: `${link.startsWith('http') ? '' : rootUrl}${item.attr('href')}`,
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

                item.description = content('#Zoom, .mian-cont, .ewb-article-info, #UCAP-CONTENT').html();
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').attr('content')), +8);
                item.category = content('meta[name="Keywords"]').attr('content')?.split(' ');

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `徐州市人力资源和社会保障局 - ${category ? $('.wb-tree-items.current').text() : '通知公告'}`,
        link: currentUrl,
        item: items,
    });
};
