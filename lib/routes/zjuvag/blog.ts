import { load } from 'cheerio'; // 可以使用类似 jQuery 的 API HTML 解析器

import type { Route } from '@/types';
// 导入必要的模组
import got from '@/utils/got'; // 自订的 got
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/zjuvag/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '博客',
    maintainers: ['KaiyoungYu'],
    handler,
};

async function handler() {
    const baseUrl = 'https://zjuvag.org/blog/';
    const { data: response } = await got(baseUrl);
    const $ = load(response);

    const items = $('div.post-preview-container')
        .find('.post-preview')
        // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
        .toArray()
        // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
        .map((item) => {
            const $item = $(item);
            const href = $item.find('a').first().attr('href');
            if (!href) {
                return;
            }
            const dateText = $item.find('.post-time').text();
            const date = dateText ? parseDate(dateText, 'YYYY-MM-DD') : undefined;
            return {
                title: $item.find('a').first().text(),
                link: new URL(href, baseUrl).href,
                pubDate: date && !Number.isNaN(date.getTime()) ? timezone(date, 0) : undefined,
                author: $item.find('.tag').first().text(),
            };
        })
        .filter((item) => item !== undefined);

    return {
        // 在此处输出您的 RSS
        title: '浙江大学可视分析小组博客',
        link: 'https://zjuvag.org/blog/',
        item: items,
    };
}
