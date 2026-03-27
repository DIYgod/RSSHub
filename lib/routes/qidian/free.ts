import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/free/:type?',
    categories: ['reading'],
    example: '/qidian/free',
    parameters: { type: '默认不填为起点中文网，填 mm 为起点女生网' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.qidian.com/free'],
            target: '/free',
        },
    ],
    name: '限时免费',
    maintainers: ['LogicJake'],
    handler,
    url: 'www.qidian.com/free',
};

async function handler(ctx) {
    const type = ctx.req.param('type');

    let link, title;
    if (type === 'mm') {
        link = 'https://www.qidian.com/mm/free';
        title = '起点女生网';
    } else {
        link = 'https://www.qidian.com/free';
        title = '起点中文网';
    }

    const response = await got(link);
    const $ = load(response.data);

    const list = $('#limit-list li');
    const out = list.toArray().map((item) => {
        item = $(item);

        const img = `<img src="https:${item.find('.book-img-box img').attr('src')}">`;
        const rank = `<p>评分：${item.find('.score').text()}</p>`;
        const update = `<a href=https:${item.find('p.update > a').attr('href')}>${item.find('p.update > a').text()}</a>`;

        return {
            title: item.find('.book-mid-info h4 a').text(),
            description: img + rank + update + '<br>' + item.find('p.intro').html(),
            pubDate: parseRelativeDate(item.find('p.update span').text()),
            link: 'https:' + item.find('.book-mid-info h4 a').attr('href'),
            author: item.find('p.author a.name').text(),
        };
    });

    return {
        title,
        description: `限时免费-${title}`,
        link,
        item: out,
    };
}
