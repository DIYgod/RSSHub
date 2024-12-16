import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { resolve } from 'url';

export const route: Route = {
    path: '/slst/:type?',
    categories: ['university'],
    example: '/shanghaitech/slst/news',
    parameters: { 
        type: 'Type of posts, see below:\n  - `news`: 学院新闻\n  - `research`: 科研进展\n  - `notice`: 通知公告\n  Default is news' 
    },
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
            source: ['slst.shanghaitech.edu.cn/:type/list.htm', 'slst.shanghaitech.edu.cn/'],
            target: '/slst/:type',
        },
    ],
    name: 'SLST News',
    maintainers: ['Jaaayden'],
    handler: async (ctx) => {
        const { type = 'news' } = ctx.req.param();
        const baseUrl = 'https://slst.shanghaitech.edu.cn';
        
        // Map type to actual URL path
        const pathMap = {
            news: '/news/list.htm',
            research: '/researchprogress/list.htm',
            notice: '/notice/list.htm',
        };
        
        const pageUrl = `${baseUrl}${pathMap[type] || pathMap.news}`;

        const response = await got(pageUrl);
        const $ = load(response.data);

        const list = $('.news_list.list2 .news')
            .map((_, item) => {
                const $item = $(item);
                const $link = $item.find('.news_title a');
                const title = $link.text().trim();
                const link = $link.attr('href');
                const dateStr = $item.find('.news_meta').text().trim();

                // 处理链接
                let absoluteLink = '';
                if (link) {
                    if (link.startsWith('http')) {
                        absoluteLink = link;
                    } else {
                        absoluteLink = resolve(baseUrl, link);
                    }
                }

                return {
                    title,
                    link: absoluteLink,
                    pubDate: parseDate(dateStr),
                };
            })
            .get()
            .filter((item) => item.title && item.link);

        const titleMap = {
            news: '上海科技大学生命学院 - 学院新闻',
            research: '上海科技大学生命学院 - 科研进展',
            notice: '上海科技大学生命学院 - 通知公告',
        };

        return {
            title: titleMap[type] || '上海科技大学生命学院新闻',
            link: pageUrl,
            item: list,
        };
    },
};