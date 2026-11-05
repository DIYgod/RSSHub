import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://news.zjnu.edu.cn';

export const route: Route = {
    path: '/news',
    categories: ['university'],
    example: '/zjnu/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '浙师要闻',
    maintainers: ['gushen610140'],
    handler,
};

async function handler() {
    const response = await ofetch(`${host}/8449/list.htm`);
    const $ = load(response);

    const list = $('ul.wp_article_list>li.list_item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.Article_Title a');
            const href = a.attr('href')?.trim();
            if (!href) {
                return null;
            }
            return {
                title: a.attr('title') || a.text(),
                link: new URL(href, host).href,
                pubDate: timezone(parseDate($item.find('div.ex_fields>span.Article_PublishDate').text(), 'YYYY-MM-DD'), 8),
            };
        })
        .filter((item) => item !== null);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detail = await ofetch(item.link);
                const $detail = load(detail);
                return {
                    ...item,
                    description: $detail('div.Article_Content').html() ?? '',
                    author: $detail('.info_xx .Article_Author').text() || undefined,
                };
            })
        )
    );

    return {
        title: '浙师要闻',
        link: `${host}/8449/list.htm`,
        item: items,
    };
}
