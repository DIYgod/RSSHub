import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    name: '53AI - AI News Feed',
    description: 'RSS feed for 53AI news articles from the last 3 days.',
    maintainers: ['houzl'],
    example: '/53ai/news',
    handler: async () => {
        const baseUrl = 'https://www.53ai.com';
        const items: { title: string; link: string; description: string; pubDate: Date }[] = [];
        let page = 1;
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

        while (true) {
            const url = page === 1 ? `${baseUrl}/news.html` : `${baseUrl}/news.html?page=${page}`;
            // eslint-disable-next-line no-await-in-loop
            const response = await ofetch(url);
            const $ = load(response);

            const pageItems = $('.news .news-box .new-left ul.list li')
                .toArray()
                .map((element) => {
                    const item = $(element);
                    const a = item.find('a.item').first();
                    const title = a.find('.title span').text();
                    const href = a.attr('href');
                    if (!href) {
                        throw new Error('链接不存在');
                    }
                    const link = new URL(href, baseUrl).href;
                    const desc = a.find('.desc').text().trim();
                    const pubDate = parseDate(a.find('.release-date span').eq(1).text().trim());
                    return {
                        title,
                        link,
                        description: desc,
                        pubDate,
                    };
                });

            items.push(...pageItems);
            // 检查是否已经获取到足够的数据
            const lastItem = pageItems.at(-1);
            if (pageItems.length === 0 || (lastItem && lastItem.pubDate < threeDaysAgo)) {
                break;
            }

            page++;
        }

        // 过滤掉超过3天的项目
        const filteredItems = items.filter((item) => item.pubDate >= threeDaysAgo);

        return {
            title: '53AI - AI News Feed (Last 3 Days)',
            link: `${baseUrl}/news.html`,
            item: filteredItems,
        };
    },
};