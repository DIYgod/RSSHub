import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

type NewsCategory = {
    title: string;
    baseUrl: string;
    description: string;
};

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

const handler: Route['handler'] = async (context) => {
    const category = context.req.param('category');
    const BASE_URL = NEWS_TYPES[category].baseUrl;
    // Fetch the index page
    const { data: listResponse } = await got(BASE_URL);
    const $ = load(listResponse);

    // Select all list items containing news information
    const ITEM_SELECTOR = 'ul[class*="list_14"] > li';
    const listItems = $(ITEM_SELECTOR);

    // Map through each list item to extract details
    const contentLinkList = listItems.toArray().map((element) => {
        const title = $(element).find('a').attr('title')!;
        const relativeLink = $(element).find('a').attr('href')!;
        return {
            title,
            link: relativeLink,
        };
    });

    return {
        title: '计算机职业技术资格考试（软考）最新动态',
        description: '计算机职业技术资格考试（软考）网站最新动态和消息推送',
        link: BASE_URL,
        image: 'https://www.gov.cn/images/gtrs_logo_lt.png',
        item: (await Promise.all(
            contentLinkList.map((item) =>
                cache.tryGet(
                    item.link,
                    async () => {
                        const CONTENT_SELECTOR = '#p_content';
                        const TIME_SELECTOR = '#p_publishtime';
                        const { data: contentResponse } = await got(item.link);
                        const contentPage = load(contentResponse);
                        const content = contentPage(CONTENT_SELECTOR).html() || '';
                        const originLink = `http://www.cpta.com.cn/${item.link}`;
                        const publishTime = contentPage(TIME_SELECTOR).text() as string;
                        const formattedDate = parseDate(publishTime);
                        return {
                            title: item.title,
                            pubDate: formattedDate,
                            link: item.link,
                            description: content,
                            category: ['study'],
                            guid: originLink,
                            id: originLink,
                            image: 'https://www.gov.cn/images/gtrs_logo_lt.png',
                            content,
                            updated: formattedDate,
                            language: 'zh-CN',
                        };
                    },
                    129600
                )
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
