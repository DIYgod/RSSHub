import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import { Route } from '@/types';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/cnu/jwc',
    parameters: {},
    radar: [
        {
            source: ['jwc.cnu.edu.cn/tzgg/index.htm'],
            target: '/cnu/jwc',
        },
    ],
    name: '教务处通知公示',
    maintainers: ['liueic'],
    handler,
    url: 'jwc.cnu.edu.cn/tzgg/index.htm',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};

async function handler() {
    const baseUrl = 'https://jwc.cnu.edu.cn';
    const link = `${baseUrl}/tzgg/index.htm`;
    const response = await got(link);
    const $ = load(response.data);

    const list = $('li > a')
        .has('span.title')
        .toArray()
        .map((e) => {
            const item = $(e);
            const href = item.attr('href');
            const linkUrl = href?.startsWith('http') ? href : `${baseUrl}/tzgg/${href}`;

            const dateSpan = item.find('span.date');
            const day = dateSpan.find('span.day').text().trim();
            const year = dateSpan.find('span.year').text().trim();
            const pubDate = year && day ? parseDate(`${year}-${day.padStart(2, '0')}`, 'YYYY-MM-DD') : null;

            const categoryName = item.find('span.name').text().trim();
            return {
                title: item.find('span.title').text().trim(),
                link: linkUrl,
                pubDate: pubDate || undefined,
                category: categoryName ? [categoryName] : undefined,
                description: '',
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    const articleContent = $('div.article, article.content, .content').first().html();
                    if (articleContent) {
                        item.description = articleContent;
                    }
                    return item;
                } catch {
                    // 如果获取详情页失败，返回基本信息
                    return item;
                }
            })
        )
    );

    return {
        title: '首都师范大学教务处 - 通知公示',
        link,
        description: '首都师范大学教务处通知公示',
        item: items,
    };
}
