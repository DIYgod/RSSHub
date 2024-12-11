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
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

        const fetchPage = async (page: number) => {
            const url = page === 1 ? `${baseUrl}/news.html` : `${baseUrl}/news.html?page=${page}`;
            const response = await ofetch(url);
            const $ = load(response);
            return $('.news .news-box .new-left ul.list li')
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
        };
        const fetchAllPages = async (page: number, accumulatedItems: NewsItem[] = []): Promise<NewsItem[]> => {
            const pageItems: NewsItem[] = await fetchPage(page);
            const newItems: NewsItem[] = [...accumulatedItems, ...pageItems];
            const lastItem: NewsItem | undefined = pageItems.at(-1);

            return pageItems.length === 0 || (lastItem && lastItem.pubDate < threeDaysAgo) ? newItems : fetchAllPages(page + 1, newItems);
        };

        const items = await fetchAllPages(1);

        // 过滤掉超过3天的项目
        const filteredItems = items.filter((item) => item.pubDate >= threeDaysAgo);

        return {
            title: '53AI - AI News Feed (Last 3 Days)',
            link: `${baseUrl}/news.html`,
            item: filteredItems,
        };
    },
};

interface NewsItem {
    pubDate: Date;
    title?: string;
    content?: string;
}
