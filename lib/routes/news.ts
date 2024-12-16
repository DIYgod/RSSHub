import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['university'],
    example: '/shanghaitech/1004',
    parameters: { 
        category: 'Category ID, see below:\n  - `1001`: News\n  - `1004`: Notices\n  Default is 1001 (News)' 
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
            source: ['shanghaitech.edu.cn/:category/list.htm', 'shanghaitech.edu.cn/'],
            target: '/:category',
        },
    ],
    name: 'University Updates',
    maintainers: ['YourGitHubUsername'],
    handler: async (ctx) => {
        const { category = '1001' } = ctx.req.param();
        const baseUrl = 'https://www.shanghaitech.edu.cn';
        const pageUrl = `${baseUrl}/${category}/list.htm`;

        const response = await got(pageUrl);
        const $ = load(response.data);

        const list = $('li.news')
            .map((_, item) => {
                const $item = $(item);
                const link = $item.find('a.news_box').attr('href');
                const imgElem = $item.find('.news_imgs img');
                
                // Create description with image if it exists
                let description = $item.find('.news_text').text().trim();
                if (imgElem.length > 0) {
                    const imgUrl = baseUrl + imgElem.attr('src');
                    description = `<img src="${imgUrl}" /><br/>${description}`;
                }

                return {
                    title: $item.find('.news_title').text().trim(),
                    link: baseUrl + link,
                    description: description,
                    pubDate: parseDate($item.find('.news_times').text().trim()),
                };
            })
            .get();

        const titleMap = {
            '1001': '上海科技大学新闻',
            '1004': '上海科技大学通知公告',
            'cmsj': '上海科技大学媒体聚焦',
        };

        return {
            title: titleMap[category] || '上海科技大学信息',
            link: pageUrl,
            item: list,
        };
    },
};