import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://genetics.cas.cn';

export const route: Route = {
    path: '/genetics/:path{.+}',
    categories: ['university'],
    example: '/cas/genetics/jixs/yg',
    parameters: { path: '路径，可在 URL 找到' },
    name: '遗传与发育生物学研究所',
    maintainers: ['panyq357'],
    handler,
    description: `| 路径                   | 栏目       |
| :--------------------- | :--------- |
| jixs/yg                | 学术预告   |
| dtxw/kyjz              | 科研进展   |
| edu/zsxx/ssszs\\_187556 | 硕士生招生 |
| edu/zsxx/bsszs\\_187557 | 博士生招生 |
| dqyd/djgz/dwyw         | 党委要闻   |`,
};

async function handler(ctx) {
    const path = ctx.req.param('path');

    const currentUrl = `${baseUrl}/${path}/`;

    const { data: response } = await got(currentUrl);
    const $ = load(response);

    let items;

    if (path.slice(0, 3) === 'edu') {
        items = $('li.box-s.h16')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('a').first();
                const date = $item.find('.box-date');
                return {
                    title: a.text(),
                    link: new URL(a.attr('href')!, currentUrl).href,
                    pubDate: parseDate(date.text(), 'YYYY-MM-DD'),
                };
            });
    } else if (path.slice(0, 4) === 'dqyd') {
        items = $('div.list-tab ul li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('a').first();
                const date = $item.find('.right').first();
                return {
                    title: a.text(),
                    link: new URL(a.attr('href')!, currentUrl).href,
                    pubDate: parseDate(date.text(), 'YYYY-MM-DD'),
                };
            });
    } else {
        items = $('li.row.no-gutters.py-1')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('a').first();
                const date = $item.find('.col-news-date');
                return {
                    title: a.text(),
                    link: new URL(a.attr('href')!, currentUrl).href,
                    pubDate: parseDate(date.text(), 'YYYY.MM.DD'),
                };
            });
    }

    return {
        title: $('head title').text(),
        link: currentUrl,
        item: items,
    };
}
