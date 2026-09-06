import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['other'],
    example: '/noi',
    name: '新闻',
    maintainers: ['WenryXu'],
    handler,
};

async function handler() {
    const response = await ofetch('https://www.noi.cn/xw/index.shtml');
    const $ = load(response);
    const postList = $('.news-all .news-item').toArray();

    const result = await Promise.all(
        postList.map((item) => {
            const $item = $(item);
            const title = $item.find('a').text();
            const link = 'https://www.noi.cn' + $item.find('a').attr('href');
            const pubDate = timezone(parseDate($item.find('small').text()), 8);

            return cache.tryGet(link, async () => {
                const detail = await ofetch(link);
                const $detail = load(detail);

                return {
                    title,
                    link,
                    guid: link,
                    pubDate,
                    description: $detail('.news-cont').html(),
                };
            });
        })
    );

    return {
        title: '新闻 - NOI 全国青少年信息学奥林匹克竞赛',
        link: 'https://www.noi.cn/articles.html?type=1',
        item: result,
    };
}
