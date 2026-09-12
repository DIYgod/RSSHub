import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/xinwenlianbo',
    categories: ['traditional-media'],
    example: '/govopendata/xinwenlianbo',
    radar: [{ source: ['cn.govopendata.com/xinwenlianbo'] }],
    features: { antiCrawler: true },
    name: '新闻联播文字版',
    maintainers: ['luyuhuang'],
    handler,
};

const rootUrl = 'https://cn.govopendata.com/xinwenlianbo/';

async function handler() {
    const response = await ofetch(rootUrl);

    const $ = load(response);
    const list = $('article.news-card')
        .toArray()
        .slice(0, 10)
        .map((item) => {
            const $item = $(item);
            const a = $item.find('h2.news-title a');
            const title = a.text().trim();
            return {
                title,
                link: new URL(a.attr('href')!, rootUrl).href,
                description: $item.find('ul').html(),
                pubDate: timezone(parseDate(`${/(\d{4}-\d+-\d+)/.exec(title)![1]} 19:00`), 8),
            };
        });

    return {
        title: '新闻联播 文字版',
        link: rootUrl,
        item: list,
    };
}
