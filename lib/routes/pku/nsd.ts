import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';
import { finishArticleItem, WeChatMpError } from '@/utils/wechat-mp';

const baseUrl = 'https://nsd.pku.edu.cn/sylm/gd/';

const pageType = (href) => {
    if (!href.startsWith('http')) {
        return 'in-site';
    }
    const url = new URL(href);
    if (url.hostname === 'mp.weixin.qq.com') {
        return 'wechat-mp';
    }
    if (url.hostname === 'news.pku.edu.cn') {
        return 'pku-news';
    }
    return 'unknown';
};

export const route: Route = {
    path: '/nsd/gd',
    categories: ['university'],
    example: '/pku/nsd/gd',
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
            source: ['nsd.pku.edu.cn/'],
        },
    ],
    name: '观点 - 国家发展研究院',
    maintainers: ['MisLink'],
    handler,
    url: 'nsd.pku.edu.cn/',
};

async function handler() {
    const response = await got(baseUrl);

    const $ = load(response.data);
    const list = $('div.maincontent > ul > li')
        .toArray()
        .map((item): DataItem & { type: string } => {
            const href = $(item).find('a').attr('href');
            const type = pageType(href);
            return {
                title: $(item).find('a').text(),
                link: type === 'in-site' ? baseUrl + href : href,
                pubDate: parseDate(`${$(item).find('span').text()}T00:00:00Z`),
                type,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            switch (item.type) {
                case 'wechat-mp':
                    try {
                        return await finishArticleItem(item);
                    } catch (error) {
                        if (error instanceof WeChatMpError && error.message.startsWith('wechat-mp: request blocked by WAF:')) {
                            return item;
                        }
                        throw error;
                    }
                case 'pku-news':
                    return getArticle(item, 'div.pageArticle > div.col.lf');
                case 'in-site':
                    return getArticle(item, 'div.article');
                default:
                    return item;
            }
        },
        { concurrency: 3 }
    );

    return {
        title: '观点 - 北京大学国家发展研究院',
        link: baseUrl,
        item: items,
    };
}

async function getArticle(item: DataItem, selector: string) {
    const article = await cache.tryGet(`pku:nsd:article:v6:${item.link}`, async () => {
        const response = await got(item.link!);
        const $ = load(response.data);
        const content = $(selector);
        if (selector !== 'div.article') {
            return { description: content.html() };
        }
        const publishedAt = content
            .children('h5')
            .text()
            .match(/发布日期：\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/)![1];
        return {
            title: content.children('.article-title').text(),
            description: content.children('.article-section').html(),
            pubDate: parseDate(`${publishedAt.replace(' ', 'T')}+08:00`),
        };
    });
    return { ...item, ...article };
}
