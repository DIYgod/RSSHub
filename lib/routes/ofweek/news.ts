import { load } from 'cheerio';
import iconv from 'iconv-lite';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/ofweek/news',
    name: '新闻',
    maintainers: ['luyuhuang'],
    handler,
};

async function handler() {
    const currentUrl = 'https://www.ofweek.com/CATList-8100-CHANGYIEXINWE.html';
    const response = await ofetch(currentUrl, { responseType: 'arrayBuffer' });

    const $ = load(iconv.decode(Buffer.from(response), 'gbk'));
    const list = $('div.list-left div.con-details h3 > a')
        .slice(0, 20)
        .toArray()
        .map((item) => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: $item.attr('href'),
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const res = await ofetch(item.link!, { responseType: 'arrayBuffer' });
                const content = load(iconv.decode(Buffer.from(res), 'gbk'));
                const artical = content('div.artical');

                item.description = artical.find('#articleC').html();
                item.author = artical.find('div.source-name').text();
                item.pubDate = timezone(parseDate(artical.find('div.time.fl').text()), 8);

                return item;
            })
        )
    );

    return {
        title: '高科技行业门户',
        link: currentUrl,
        item: items,
    };
}
