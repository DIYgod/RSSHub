// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'bkszs';

    const rootUrl = 'https://dky.sicau.edu.cn';
    const currentUrl = `${rootUrl}/zsjy/${category}.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('a.tit')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                pubDate: parseDate(item.prev().text()),
                link: `${rootUrl}${item.attr('href').replace(/\.\./, '/')}`,
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

                content('.v_news_content p').slice(0, 2).remove();

                item.description = content('.v_news_content').html();

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
