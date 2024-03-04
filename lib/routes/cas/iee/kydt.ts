// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const rootUrl = 'http://www.iee.cas.cn/xwzx/kydt/';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = load(response.data);
    const list = $('li.entry .entry-content-title')
        .slice(0, 15)
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.description = content('.article-content').html();
                item.pubDate = timezone(parseDate(content('time').text().split('：')[1]), 8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '科研成果 - 中国科学院电工研究所',
        link: rootUrl,
        item: items,
    });
};
