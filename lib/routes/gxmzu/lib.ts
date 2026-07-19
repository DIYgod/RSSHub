import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { parsePubDate, resolveArticles } from './utils';

const pageUrl = 'https://library.gxmzu.edu.cn/news/news_list.jsp?urltype=tree.TreeTempUrl&wbtreeid=1010';

export const route: Route = {
    path: '/libzxxx',
    categories: ['university'],
    example: '/gxmzu/libzxxx',
    parameters: {},
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
            source: ['library.gxmzu.edu.cn/news/news_list.jsp', 'library.gxmzu.edu.cn/'],
        },
    ],
    name: '图书馆最新消息',
    maintainers: ['real-jiakai'],
    handler,
    url: 'library.gxmzu.edu.cn/news/news_list.jsp',
    description: '部分消息发布于微信公众号等站外页面，此类消息仅输出标题与原文链接。',
};

async function handler() {
    const response = await ofetch(pageUrl);
    const $ = load(response);

    const list = $('#newslist ul li')
        .toArray()
        .map((el) => {
            const $item = $(el);
            const $link = $item.find('a');
            const href = $link.attr('href');
            if (!href) {
                return null;
            }
            return {
                title: $link.text().trim(),
                link: new URL(href, pageUrl).href,
                pubDate: parsePubDate($item.find('span').text()),
            };
        })
        .filter((item) => item !== null);

    const items = await resolveArticles(list, pageUrl, {
        title: 'h2',
        content: '.v_news_content',
    });

    return {
        title: '广西民族大学图书馆 -- 最新消息',
        link: pageUrl,
        item: items,
    };
}
