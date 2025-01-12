import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

type NewsCategory = {
    title: string;
    baseUrl: string;
    description: string;
};

const WEBSITE_URL = 'http://www.cpta.com.cn';

const NEWS_TYPES: Record<string, NewsCategory> = {
    notice: {
        title: '通知公告',
        baseUrl: 'http://www.cpta.com.cn/notice.html',
        description: '中国人事考试网 考试通知公告汇总',
    },
    performance: {
        title: '成绩公布',
        baseUrl: 'http://www.cpta.com.cn/performance.html',
        description: '中国人事考试网 考试成绩公布汇总',
    },
};

async function randomPause() {
    // Random pause 3-10 seconds intently for avoiding IP gateway frequency restriction.
    const randomDelay = Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000;
    return await new Promise((resolve) => setTimeout(resolve, randomDelay));
}

const handler: Route['handler'] = async (context) => {
    const category = context.req.param('category');
    const BASE_URL = NEWS_TYPES[category].baseUrl;
    // Fetch the index page
    const { data: listResponse } = await got(BASE_URL);
    const $ = load(listResponse);

    // Select all list items containing news information
    const ITEM_SELECTOR = 'ul[class*="list_14"] > li:has(*)';
    const listItems = $(ITEM_SELECTOR);

    // Map through each list item to extract details
    const contentLinkList = listItems
        .toArray()
        .map((element) => {
            const title = $(element).find('a').attr('title')!;
            const date = $(element).find('i').text()!.replaceAll(/[[\]]/g, '');
            const relativeLink = $(element).find('a').attr('href')!;
            const absoluteLink = new URL(relativeLink, WEBSITE_URL).href;
            return {
                title,
                date,
                link: absoluteLink,
            };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

    return {
        title: `中国人事考试网-${NEWS_TYPES[category].title}`,
        description: NEWS_TYPES[category].description,
        link: BASE_URL,
        image: 'https://www.gov.cn/images/gtrs_logo_lt.png',
        item: (await Promise.all(
            contentLinkList.map((item) =>
                cache.tryGet(item.link, async () => {
                    const CONTENT_SELECTOR = '#p_content';
                    await randomPause();
                    const { data: contentResponse } = await got(item.link);
                    const contentPage = load(contentResponse);
                    const content = contentPage(CONTENT_SELECTOR).html() || '';
                    return {
                        title: item.title,
                        pubDate: item.date,
                        link: item.link,
                        description: content,
                        category: ['study'],
                        guid: item.link,
                        id: item.link,
                        image: 'https://www.gov.cn/images/gtrs_logo_lt.png',
                        content,
                        updated: item.date,
                        language: 'zh-CN',
                    };
                })
            )
        )) as DataItem[],
        allowEmpty: true,
        language: 'zh-CN',
        feedLink: `https://rsshub.app/cpta/${category}`,
        id: `https://rsshub.app/cpta/${category}`,
    };
};

export const route: Route = {
    path: '/:category',
    name: '中国人事考试网发布',
    maintainers: ['PrinOrange'],
    handler,
    categories: ['study'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
        antiCrawler: true,
    },
    radar: [
        {
            title: '中国人事考试网通知公告',
            source: ['www.cpta.com.cn/notice.html', 'www.cpta.com.cn'],
            target: `/notice`,
        },
        {
            title: '中国人事考试网成绩发布',
            source: ['www.cpta.com.cn/performance.html', 'www.cpta.com.cn'],
            target: `/performance`,
        },
    ],
    example: '/cpta/notice',
};
