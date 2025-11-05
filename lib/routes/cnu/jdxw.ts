import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import { Route } from '@/types';

export const route: Route = {
    path: '/jdxw',
    categories: ['university'],
    example: '/cnu/jdxw',
    parameters: {},
    radar: [
        {
            source: ['news.cnu.edu.cn/xysx/jdxw/index.htm'],
            target: '/cnu/jdxw',
        },
    ],
    name: '焦点关注',
    maintainers: ['liueic'],
    handler,
    url: 'news.cnu.edu.cn/xysx/jdxw/index.htm',
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
    const baseUrl = 'https://news.cnu.edu.cn';
    const link = `${baseUrl}/xysx/jdxw/index.htm`;
    const response = await got(link);
    const $ = load(response.data);

    const list = $('ul.list3 > li')
        .toArray()
        .map((e) => {
            const item = $(e);
            const a = item.find('a');
            const href = a.attr('href');
            const linkUrl = href?.startsWith('http') ? href : `${baseUrl}/xysx/jdxw/${href}`;

            return {
                title: item.find('span.listTitle').text().trim(),
                link: linkUrl,
                pubDate: parseDate(item.find('span.listDate').text().trim(), 'YYYY-MM-DD'),
                description: item.find('span.listCon').text().trim(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link);
                    const $ = load(response.data);
                    const articleContent = $('div.gp-article').html();
                    if (articleContent) {
                        item.description = articleContent;
                    }
                    return item;
                } catch {
                    // 如果获取详情页失败，使用列表页的摘要
                    return item;
                }
            })
        )
    );

    return {
        title: '首都师范大学新闻网 - 焦点关注',
        link,
        description: '首都师范大学新闻网焦点关注栏目最新新闻',
        item: items,
    };
}
