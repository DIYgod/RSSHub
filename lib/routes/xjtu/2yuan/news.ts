// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const id = ctx.req.param('id') ?? '110';

    const rootUrl = 'http://2yuan.xjtu.edu.cn';
    const currentUrl = `${rootUrl}/Html/News/Columns/${id}/Index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.column_list h2')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: `${rootUrl}${item.find('a').attr('href')}`,
                pubDate: timezone(parseDate(item.find('.dy_date').text()), +8),
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

                item.description = content('#zoom').html();
                item.pubDate = timezone(
                    parseDate(
                        content('.sub_tit3 strong')
                            .first()
                            .text()
                            .replace(/发布时间：/, '')
                    ),
                    +8
                );

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
