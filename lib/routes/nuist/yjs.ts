// @ts-nocheck
import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const path = getSubPath(ctx) === '/yjs/' ? 'index/tzgg' : getSubPath(ctx).replace(/^\/yjs\//, '');

    const rootUrl = 'https://yjs.nuist.edu.cn';
    const currentUrl = `${rootUrl}/${path}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.gridlinediv')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a').last();

            return {
                title: a.text(),
                link: new URL(a.attr('href'), currentUrl).href,
                pubDate: parseDate(item.next().text(), 'YYYY年MM月DD日'),
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

                const timeMatches = content('.bar')
                    .text()
                    .match(/(\d{4}年\d{2}月\d{2}日 \d{2}:\d{2})/);

                item.description = content('.v_news_content').html();
                item.pubDate = timeMatches ? timezone(parseDate(timeMatches[1], 'YYYY年MM月DD日 HH:mm'), +8) : item.pubDate;

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
