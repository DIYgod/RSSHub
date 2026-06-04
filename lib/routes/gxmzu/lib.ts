import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch'; // 使用ofetch库代替got
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const url = 'https://library.gxmzu.edu.cn/news/news_list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1010';
const host = 'https://library.gxmzu.edu.cn';

export const route: Route = {
    path: '/libzxxx',
    categories: ['university'],
    example: '/gxmzu/libzxxx',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['library.gxmzu.edu.cn/news/news_list.jsp', 'library.gxmzu.edu.cn/'],
        },
    ],
    name: '图书馆最新消息',
    maintainers: ['real-jiakai'],
    handler,
    url: 'library.gxmzu.edu.cn/news/news_list.jsp',
};

async function handler() {
    const response = await ofetch(url);
    if (!response) {
        return;
    }
    const $ = load(response);

    const list = $('#newslist ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: new URL(item.find('a').attr('href'), host).href,
                pubDate: timezone(parseDate(item.find('span').text(), 'YYYY-MM-DD'), +8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.link && !item.link.startsWith('https://library.gxmzu.edu.cn/')) {
                    item.description = '该通知无法直接预览，请点击原文链接↑查看';
                    return item;
                }

                const response = await ofetch(item.link);
                if (!response || (response.status >= 300 && response.status < 400)) {
                    item.description = '该通知无法直接预览，请点击原文链接↑查看';
                } else {
                    const $ = load(response);
                    item.title = $('h2').text();
                    item.description = $('.v_news_content').html();
                }
                return item;
            })
        )
    );

    return {
        title: '广西民族大学图书馆 -- 最新消息',
        link: url,
        item: out,
    };
}
