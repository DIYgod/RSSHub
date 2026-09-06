import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/latest',
    categories: ['bbs'],
    example: '/samsungmembers/latest',
    name: '最新帖子',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const currentUrl = 'https://www.samsungmembers.cn/bbs/';
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('div.ImgList dl dt')
        .slice(0, 15)
        .toArray()
        .map((item) => {
            const a = $(item).find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, 'http://www.samsungmembers.cn/').href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await ofetch(item.link);
                const content = load(res);
                return {
                    ...item,
                    pubDate: timezone(parseDate(content('p.data').last().text()), 8),
                    description: content('div.BSHARE_POP').html(),
                };
            })
        )
    );

    return {
        title: '三星盖乐世社区 - 最新帖子',
        link: currentUrl,
        item: items,
    };
}
