import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { Route } from '@/types';

export const route: Route = {
    path: '/physics',
    categories: ['university'],
    example: '/cnu/physics',
    parameters: {},
    radar: [
        {
            source: ['physics.cnu.edu.cn/news/index.htm'],
            target: '/cnu/physics',
        },
    ],
    name: '物理系院系新闻',
    maintainers: ['liueic'],
    handler,
    url: 'physics.cnu.edu.cn/news/index.htm',
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
    const baseUrl = 'https://physics.cnu.edu.cn';
    const link = `${baseUrl}/news/index.htm`;
    const response = await got(link);
    const $ = load(response.data);

    const list = $('.list ul > li')
        .has('span')
        .toArray()
        .map((e) => {
            const item = $(e);
            const span = item.find('span');
            const a = item.find('a');

            // 提取日期 [YYYY-MM-DD]
            const dateText = span.text().trim();
            const dateMatch = dateText.match(/\[(\d{4}-\d{2}-\d{2})\]/);
            const pubDate = dateMatch ? parseDate(dateMatch[1], 'YYYY-MM-DD') : undefined;

            // 提取标题
            const title = a.text().trim() || a.attr('title') || '';

            // 从 onclick 属性中提取链接
            const onclick = a.attr('onclick') || '';
            const hrefMatch = onclick.match(/checkXnwk\(['"]([^'"]+)['"]/);
            const href = hrefMatch ? hrefMatch[1] : '';

            // 处理相对路径
            let linkUrl = '';
            if (href) {
                if (href.startsWith('http')) {
                    linkUrl = href;
                } else {
                    // 使用 URL 构造函数处理所有类型的相对路径（包括 '../' 和 '../..' 等）
                    try {
                        linkUrl = new URL(href, `${baseUrl}/news/`).href;
                    } catch {
                        // 如果 URL 构造失败，回退到简单拼接
                        linkUrl = href.startsWith('../') ? `${baseUrl}/${href.replaceAll('../', '')}` : `${baseUrl}/news/${href}`;
                    }
                }
            }

            return {
                title,
                link: linkUrl,
                pubDate,
                description: '',
            };
        })
        .filter((item) => item.title && item.link); // 过滤掉导航链接

    return {
        title: '首都师范大学物理系 - 院系新闻',
        link,
        description: '首都师范大学物理系院系新闻',
        item: list,
    };
}
