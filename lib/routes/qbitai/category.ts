import { Route } from '@/types';
import parser from '@/utils/rss-parser';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/category/:category',
    categories: ['new-media', 'popular'],
    example: '/qbitai/category/资讯',
    parameters: { category: '分类名，见下表' },
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
            source: ['qbitai.com/category/:category'],
        },
    ],
    name: '分类',
    maintainers: ['FuryMartin, Geraldxm'],
    handler,
    description: `| 资讯 | 数码     | 智能车 | 智库  | 活动    |
| ---- | -------- | ------ | ----- | ------- |
| 资讯 | ebandeng | auto   | zhiku | huodong |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const link = encodeURI(`https://www.qbitai.com/category/${category}/feed`);
    const feed = await parser.parseURL(link);

    const items = feed.items.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.pubDate ?? ''),
        link: item.link,
        author: '量子位',
        category: item.categories,
        // 初始化 description 字段
        description: '',
    }));

    // 使用 Promise.all 并发处理所有项目
    await Promise.all(
        items.map(async (item) => {
            try {
                // 尝试从缓存中获取 description
                const cachedDescription = await cache.tryGet(`description:${item.link}`, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    // 获取文章内容，这里假设文章内容在 .article 类中
                    const articleHtml = $('.article').html();
                    return articleHtml || '';
                });

                // 设置 description 字段
                item.description = cachedDescription;
            } catch {
                item.description = '内容获取失败';
            }
        })
    );

    return {
        // 源标题
        title: `量子位 - ${category}`,
        // 源链接
        link: `https://www.qbitai.com/category/${category}`,
        // 源文章
        item: items,
    };
}

/*
<item>
<title>刚刚，Kimi开源底层推理框架，1小时GitHub揽星1.2k</title>
<description/>
<link>https://www.qbitai.com/2024/11/225771.html</link>
<guid isPermaLink="false">https://www.qbitai.com/2024/11/225771.html</guid>
<pubDate>Thu, 28 Nov 2024 08:01:56 GMT</pubDate>
<author>量子位</author>
<category>资讯</category>
<category>Kimi</category>
</item>
*/
