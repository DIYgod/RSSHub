import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/waytoagi/news',
    name: 'Way to AGI - 知识库精选',
    description: 'Way to AGI 知识库精选文章的RSS订阅源（最近3天）',
    maintainers: ['your-github-username'],
    example: '/waytoagi/news',
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
                const content = $('.prose').html();

                console.log(`Processing ${url}`);
                console.log(`Title: ${title}`);
                console.log(`Content length: ${content ? content.length : 0}`);

                // 提取文章列表
                const articleList = $('.prose ul li')
                    .map((_, element) => $(element).text().trim())
                    .get();

                console.log(`Article list length: ${articleList.length}`);

                if (!title || !content || articleList.length === 0) {
                    console.log(`Warning: Missing data for ${url}`);
                    console.log(`Page HTML: ${$.html()}`);
                }

                items.push({
                    title: title || `知识库精选 - ${date}`,
                    link: url,
                    description: content || '暂无内容',
                    pubDate: parseDate(date, 'YYYYMMDD'),
                    articleList: articleList
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
            item: items.map(item => ({
                title: item.title,
                link: item.link,
                description: `
                    <h3>文章列表：</h3>
                    <ul>
                        ${item.articleList.map(article => `<li>${article}</li>`).join('')}
                    </ul>
                    ${item.description}
                `,
                pubDate: item.pubDate
            })),
        };
    },
};