import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/tzggcdunews',
    categories: ['university'],
    example: '/cdu/tzggcdunews',
    parameters: {},
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
            source: ['news.cdu.edu.cn/'],
        },
    ],
    name: '通知公告',
    maintainers: ['uuwor'],
    handler,
    url: 'news.cdu.edu.cn/',
};

async function handler() {
    const baseUrl = 'https://news.cdu.edu.cn';
    const url = `${baseUrl}/tzgg.htm`;
    const response = await got.get(url);
    const $ = load(response.data);

    const list = $('.row-f1 ul.ul-mzw-news-a2 li a.con')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const element = $(item);
            // 优先使用title属性内容，避免内容被截断
            const title = element.attr('title') || element.find('.tit').text().trim();
            const link = element.attr('href');
            const dateText = element.find('.date').text().trim();
            const pubDate = timezone(parseDate(dateText), 8);

            return {
                title,
                // 处理相对路径链接
                link: link.startsWith('http') ? link : new URL(link, baseUrl).href,
                pubDate,
                author: '成都大学官网通知公告',
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                const $ = load(response.data);

                // 清理无关内容并提取正文
                const content = $('.v_news_content');
                // 移除版权声明等无关元素
                content.find('*[style*="text-align: right"]').remove();

                item.description = content.html();
                return item;
            })
        )
    );

    return {
        title: '成都大学官网-通知公告',
        link: url,
        item: items,
    };
}
