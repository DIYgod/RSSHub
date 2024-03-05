// @ts-nocheck
import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const rootUrl = 'https://dongke.yangtzeu.edu.cn';
    const currentUrl = new URL(`${getSubPath(ctx).replace(/^\/dongke/, '') || '/yqzl/xyxw'}.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('ul.list-item li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('title').text();
                item.description = content('div.v_news_content').html();
                item.category = content('meta[name="keywords"]').prop('content').split(',');
                item.pubDate = timezone(
                    parseDate(
                        content('p.content-info')
                            .text()
                            .match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)[1]
                    ),
                    +8
                );

                return item;
            })
        )
    );

    ctx.set('data', {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        language: 'zh-cn',
        image: new URL($('#head-img a img').prop('src'), rootUrl).href,
        author: '长江大学动物科学学院',
    });
};
