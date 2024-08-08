import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    name: 'Way to AGI - 知识库精选',
    description: 'Way to AGI 知识库精选文章的RSS订阅源（最近3天）',
    maintainers: ['your-github-username'],
    example: '/way2agi/news',
    handler: async (ctx) => {
        const baseUrl = 'https://blog.waytoagi.com';
        const items = [];

        // 生成最近3天的日期
        const dates = Array.from({ length: 3 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0].replace(/-/g, '');
        });

        for (const date of dates) {
            const url = `${baseUrl}/article/news-${date}`;
            try {
                const response = await ofetch(url);
                const $ = load(response);

                const title = $('h1.text-3xl').text().trim();
                const description = $('meta[name="description"]').attr('content');

                items.push({
                    title: title,
                    link: url,
                    description: description,
                    pubDate: parseDate(date, 'YYYYMMDD'),
                });
            } catch (error) {
                console.log(`Failed to fetch or parse ${url}: ${error}`);
                // 如果某一天的文章不存在，继续尝试下一天
                continue;
            }
        }

        return {
            title: 'Way to AGI - 知识库精选（最近3天）',
            link: baseUrl,
            item: items,
        };
    },
};