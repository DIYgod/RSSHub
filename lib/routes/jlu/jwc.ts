import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/jlu/jwc',
    radar: [
        {
            source: ['jwc.jlu.edu.cn', 'jwc.jlu.edu.cn/index.htm'],
        },
    ],
    name: '教务通知',
    maintainers: ['mayouxi'],
    handler,
    url: 'jwc.jlu.edu.cn',
};

async function handler() {
    const baseUrl = 'https://jwc.jlu.edu.cn';
    const response = await got(baseUrl);
    const $ = load(response.body);

    const list = $('.section2 .s2-r .s3-list ul li');

    return {
        title: '吉林大学教务处',
        link: baseUrl,
        description: '吉林大学教务处通知公告',

        item: list?.toArray().map((item) => {
            const el = $(item);

            const linkEl = el.find('a');
            const yearMonth = el.find('.tm p').text();
            const day = el.find('.tm span').text();

            const titleDiv = el.find('.s3-info p');
            const title = titleDiv.text();

            const link = new URL(linkEl.attr('href')!, baseUrl).href;

            const date = /^\d{4}-\d{1,2}$/.test(yearMonth) && /^\d{1,2}$/.test(day) ? `${yearMonth}-${day}` : undefined;

            return {
                title,
                link,
                pubDate: date ? timezone(parseDate(date, 'YYYY-MM-DD'), 8) : undefined,
            };
        }),
    };
}
