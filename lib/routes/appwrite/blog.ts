import { Route } from '@/types';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/appwrite/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['appwrite.io/blog'],
        },
    ],
    name: 'Blog',
    maintainers: ['renkunx'],
    handler: async () => {
        // 导入 puppeteer 工具类并初始化浏览器实例
        const browser = await puppeteer();
        // 打开一个新标签页
        const page = await browser.newPage();
        // 拦截所有请求
        await page.setRequestInterception(true);
        // 仅允许某些类型的请求
        page.on('request', (request) => {
            // 在这次例子，我们只允许 HTML 请求
            request.resourceType() === 'document' ? request.continue() : request.abort();
        });
        // 访问目标链接
        const link = 'https://appwrite.io/blog';
        // ofetch 请求会被自动记录，
        // 但 puppeteer 请求不会
        // 所以我们需要手动记录它们
        logger.http(`Requesting ${link}`);
        await page.goto(link, {
            // 指定页面等待载入的时间
            waitUntil: 'domcontentloaded',
        });
        // 获取页面的 HTML 内容
        const response = await page.content();
        // 关闭标签页
        await page.close();

        const $ = load(response);

        const items = $('.web-grid-articles > li')
            .toArray()
            .map((item) => {
                item = $(item);
                const $link = item.find('a.bg-transparent');
                const $authorBlock = item.find('.flex.items-center.justify-center.gap-2');

                return {
                    title: item.find('h4.text-label').text().trim(),
                    link: $link.attr('href'),
                    pubDate: parseDate(item.find('span').first().text().trim()), // 需要日期解析函数
                    author: [
                        {
                            name: $authorBlock.find('h4.text-primary').text().trim(),
                            avatar: $authorBlock.find('img').attr('src'),
                        },
                    ],
                    image: item.find('img[loading="lazy"]').attr('src'),
                };
            });

        // 不要忘记关闭浏览器实例
        await browser.close();

        return {
            // 源标题
            title: `Appwrite Blog`,
            // 源链接
            link: `https://appwrite.io/blog`,
            // 源文章
            item: items,
        };
    },
};
