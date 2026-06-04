import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hainan/iitb/tzgg',
    categories: ['government'],
    example: '/gov/hainan/iitb/tzgg',
    url: 'iitb.hainan.gov.cn/iitb/tzgg/list2.shtml',
    name: '通知公告',
    maintainers: ['p3psi-boo'],
    handler,
};

async function handler() {
    // The TLS cert is invalid, we are limited to use HTTP unfortunately.
    const baseUrl = 'https://iitb.hainan.gov.cn';
    const targetUrl = `${baseUrl}/iitb/tzgg/list2.shtml`;

    const response = await got({
        method: 'get',
        url: targetUrl,
    });

    const $ = load(response.data);

    const alist = $('.list_div');

    const list = alist.toArray().map((item) => {
        const elem = $(item);

        const titleElement = elem.find('.list-right_title a');
        const link = titleElement.attr('href') || '';
        const title = titleElement.text().trim() || '';
        const dateText = elem.find('td[align="left"]').text().replace('发布时间：', '').trim();
        const department = elem.find('.column-name').text().trim();

        return {
            title,
            link: new URL(link, baseUrl).href,
            pubDate: parseDate(dateText),
            category: department,
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(response.data);

                const author = $('#xxgkfbjg').text();
                const pubDate = $('publishtime').text();
                const content = $('ucapcontent').html();

                item.author = author;
                item.pubDate = parseDate(pubDate);
                item.description = content;

                return item;
            })
        )
    );

    return {
        title: '通知公告 - 海南省工业和信息化厅',
        link: targetUrl,
        item: items,
    };
}
