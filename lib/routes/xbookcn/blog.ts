import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:label?', // 路由路径
    categories: ['reading'], // 分类
    example: '/xbookcn/精选作品', // 示例路径
    parameters: { label: '按名称分类，详见https://blog.xbookcn.net/p/all.html' }, // 参数
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: '短篇', // 源名称
    maintainers: ['Lyunvy'], // 维护者
    handler: async (ctx) => {
        const { label = '精选作品' } = ctx.req.param(); // 从请求参数中获取 label
        const url = `https://blog.xbookcn.net/search/label/${label}`; // 使用反引号构建 URL
        const response = await ofetch(url); // 请求源链接
        const $ = load(response); // 加载 HTML

        const articles = $('.blog-posts.hfeed .date-outer').find('.post'); // 查找文章

        const list = articles.toArray().map((elem) => {
            const a = $(elem).find('.post-title a'); // 获取标题链接
            return {
                title: a.text().trim(), // 标题
                link: a.attr('href'), // 链接
                category: [], // 分类
            };
        });

        const items = await Promise.all(
            list.map(
                async (item) =>
                    // 使用缓存以避免重复请求
                    await cache.tryGet(item.link, async () => {
                        const response = await ofetch(item.link); // 请求文章链接
                        const $ = load(response); // 加载文章页面

                        // 获取文章的完整描述
                        item.description = $('.post-body.entry-content').html() || '无内容'; // 抓取指定内容

                        // 获取分类信息
                        const categories = $('.post-labels a')
                            .toArray()
                            .map((el) => $(el).text().trim());
                        item.category = categories; // 添加多个分类信息

                        return item; // 返回带有描述和分类的文章对象
                    })
            )
        );

        return {
            title: 'xbookcn', // 源标题
            link: url, // 源链接
            item: items, // 源文章
        };
    },
};
