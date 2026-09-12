import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://jwc.njtech.edu.cn';
const link = `${host}/index/ggtz.htm`;

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/njtech/jwc',
    radar: [
        {
            source: ['jwc.njtech.edu.cn/index/ggtz.htm'],
        },
    ],
    name: '教务处',
    maintainers: ['TrumanGu'],
    handler,
    url: 'jwc.njtech.edu.cn/index/ggtz.htm',
};

async function handler() {
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.my-list li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, link).href,
                pubDate: timezone(parseDate($item.find('.date').text(), 'YYYY-MM-DD'), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.includes('/article.jsp')) {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    return { ...item, description: $('#vsb_content').html() };
                }
                return item;
            })
        )
    );

    return {
        title: '南京工业大学教务处 - 公告通知',
        link,
        item: items,
    };
}
