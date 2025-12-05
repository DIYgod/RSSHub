import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:category',
    categories: ['government'],
    example: '/scpta/news/33',
    parameters: {
        category: {
            description: '分类ID，默认为`33`(工作动态)',
            default: '33',
        },
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
            source: ['www.scpta.com.cn/front/News/List'],
            target: '/news',
        },
    ],
    name: '通知公告',
    maintainers: ['Yeye-0426'], // github ID
    handler,
    description: `| 分类                 | category_id |
|----------------------|-------------|
| 工作动态             | 33          |
| 公务员考试           | 56          |
| 专业技术人员资格考试 | 57          |
| 事业单位考试         | 67          |
| 其它                 | 72          |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const baseUrl = 'https://www.scpta.com.cn';

    // 构建请求URL
    const url = `${baseUrl}/front/News/List/${category}`;

    // 发送请求
    const response = await got(url);

    const $ = load(response.data);

    // 解析搜索结果
    const list = $('div.wrap-content li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: `${baseUrl}${item.find('a').attr('href')}`,
                pubDate: parseDate(item.find('span').text().trim()),
            };
        });
    // 获取公告详情
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                let description = '';
                try {
                    const contentResponse = await got(item.link);
                    const content = load(contentResponse.data);

                    // 提取公告正文
                    description = content('div.wrap-content.news-content').html();
                } catch {
                    // 如果详情页获取失败，使用默认描述
                    description = '公告内容获取失败';
                }
                item.description = description;
                return item;
            })
        )
    );

    // 生成RSS输出
    const categoryNames = {
        '33': '工作动态',
        '56': '公务员考试',
        '57': '专业技术人员资格考试',
        '67': '事业单位考试',
        '72': '其它',
    };

    return {
        title: `通知公告 - ${categoryNames[category] || '未知分类'}`,
        link: url,
        item: items,
    };
}
