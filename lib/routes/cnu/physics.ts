import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/physics',
    categories: ['university'],
    example: '/cnu/physics',
    parameters: {},
    radar: [
        {
            source: ['physics.cnu.edu.cn/news/index.htm'],
            target: '/physics',
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

            // Extract the date in [YYYY-MM-DD] format.
            const dateText = span.text();
            const dateMatch = dateText.match(/\[(\d{4}-\d{2}-\d{2})\]/);
            const pubDate = dateMatch ? timezone(parseDate(dateMatch[1], 'YYYY-MM-DD'), 8) : undefined;

            // Extract the title.
            const title = a.text().trim() || a.attr('title') || '';

            // 从 onclick 属性中Extract the link.
            const onclick = a.attr('onclick') || '';
            const hrefMatch = onclick.match(/checkXnwk\(['"]([^'"]+)['"]/);
            const href = hrefMatch ? hrefMatch[1] : '';

            // Resolve relative paths.
            let linkUrl = '';
            if (href) {
                if (href.startsWith('http')) {
                    linkUrl = href;
                } else {
                    // Resolve parent-directory paths with the URL constructor.
                    try {
                        linkUrl = new URL(href, `${baseUrl}/news/`).href;
                    } catch {
                        // Use the existing concatenation fallback if URL parsing fails.
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
        .filter((item) => item.title && item.link); // Exclude navigation links.

    return {
        title: '首都师范大学物理系 - 院系新闻',
        link,
        description: '首都师范大学物理系院系新闻',
        item: list,
    };
}
