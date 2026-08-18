import { load } from 'cheerio';
import dayjs from 'dayjs';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ranking',
    categories: ['new-media'],
    example: '/sznews/ranking',
    name: '排行榜',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.sznews.com';
    const currentUrl = `${rootUrl}/ranking/${dayjs().format('YYYY-MM-DD')}.json`;

    const response = await ofetch(currentUrl);

    const list = response.data.map((item) => ({
        title: item.TITLE,
        link: item.URL.replace('http://', 'https://'),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                let link = item.link;
                let detailResponse = await ofetch(link);

                const fulltext = detailResponse.match(/<a href="(.*)">全文阅读<\/a>/);

                if (fulltext) {
                    link = fulltext[1];
                    detailResponse = await ofetch(link);
                }

                const content = load(detailResponse);

                return {
                    ...item,
                    link,
                    description: content('.article-content').html(),
                    author: content('.a_source').text().replace('来源： ', ''),
                    pubDate: timezone(parseDate(content('.a_time').text()), 8),
                };
            })
        )
    );

    return {
        title: '焦点新闻 - 深圳新闻网',
        link: 'http://news.sznews.com',
        item: items,
    };
}
