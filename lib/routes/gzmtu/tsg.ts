import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/tsg',
    categories: ['university'],
    example: '/gzmtu/tsg',
    radar: [
        {
            source: ['lib.gzmtu.edu.cn/index/txgg.htm'],
        },
    ],
    name: '图书馆通讯公告',
    maintainers: ['skyedai910'],
    handler,
    url: 'lib.gzmtu.edu.cn/index/txgg.htm',
};

async function handler(): Promise<Data> {
    const link = 'https://lib.gzmtu.edu.cn/index/txgg.htm';
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.list_main01')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('h3 a');
            return {
                title: a.attr('title') ?? a.text(),
                link: new URL(a.attr('href')!, link).href,
                pubDate: timezone(parseDate($item.find('.list_time').text(), 'YYYY年MM月DD日'), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                item.description = $('div[id^=vsb_content]').html();
                return item;
            })
        )
    );

    return {
        title: '广州航海学院图书馆（档案馆）通讯公告',
        link,
        item: items,
        language: 'zh-CN',
    };
}
