import { Route } from '@/types';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库
import { parseDate } from '@/utils/parse-date'; // 解析日期的工具函数
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/daily-blog',
    name: '值得一读技术博客',
    maintainers: ['huyyi'],
    categories: ['programming'],
    example: '/chlinlearn/daily-blog',
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
            source: ['daily-blog.chlinlearn.top/blogs/*'],
            target: '/chlinlearn/daily-blog',
        },
    ],
    handler: async () => {
        const data = await ofetch('https://daily-blog.chlinlearn.top/api/daily-blog/getBlogs/new?type=new&pageNum=1&pageSize=20', {
            headers: {
                Referer: 'https://daily-blog.chlinlearn.top/blogs/1',
            },
        });
        const items = data.rows.map((item) => ({
            title: item.title,
            link: item.url,
            author: item.author,
            img: item.icon,
            pubDate: timezone(parseDate(item.publishTime), +8),
        }));
        return {
            // 源标题
            title: '值得一读技术博客',
            // 源链接
            link: 'https://daily-blog.chlinlearn.top/blogs/1',
            // 源文章
            item: items,
        };
    },
};
