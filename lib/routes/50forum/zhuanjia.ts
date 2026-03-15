import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['www.50forum.org.cn/portal/list/index.html?id=6', '50forum.org.cn/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['sddiky'],
    handler,
    url: 'https://www.50forum.org.cn/portal/list/index.html?id=6',
};

async function handler() {
    const rootUrl = 'https://www.50forum.org.cn';
    const response = await got({
        method: 'get',
        url: `${rootUrl}/portal/list/index.html?id=6`,
    });
    const data = response.data;
    if (!data) {
        return;
    }
    const $ = load(data);
    let out = $('div.container div.list_list.mtop10 ul li')
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);
            const link = rootUrl + item.attr('href');
            const reg = /^(.+) - (.*) - (.+)$/;
            const keyword = reg.exec(item.text().trim());
            return {
                title: keyword[1],
                author: keyword[2],
                pubDate: timezone(parseDate(keyword[3], 'YYYY-MM-DD'), +8),
                link,
            };
        });

    out = await Promise.all(
        out.map((item) =>
            cache.tryGet(item.link, async () => {
                const result = await got(item.link);

                const $ = load(result.data);

                item.description = $('div.list_content').html();
                return item;
            })
        )
    );
    return {
        title: `中国经济50人论坛专家文章`,
        link: 'https://www.50forum.org.cn/portal/list/index.html?id=6',
        description: '中国经济50人论坛专家文章',
        item: out,
    };
}
