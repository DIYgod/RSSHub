import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const BASE_URL = 'https://www.txks.org.cn/index/work.html';

const removeFontPresetting = (html: string = ''): string => {
    const $ = load(html);
    $('[style]').each((_, element) => {
        const style = $(element).attr('style') || '';
        const cleanedStyle = style.replaceAll(/font-family:[^;]*;?/gi, '').trim();
        $(element).attr('style', cleanedStyle || null);
    });
    $('style').each((_, styleElement) => {
        const cssText = $(styleElement).html() || '';
        const cleanedCssText = cssText.replaceAll(/font-family:[^;]*;?/gi, '');
        $(styleElement).html(cleanedCssText);
    });

    return $.html();
};

const handler: Route['handler'] = async () => {
    // Fetch the index page
    const { data: listResponse } = await got(BASE_URL);
    const $ = load(listResponse);

    // Select all list items containing news information
    const ITEM_SELECTOR = 'ul[class*="newsList"] > li';
    const listItems = $(ITEM_SELECTOR);

    // Map through each list item to extract details
    const contentLinkList = listItems.toArray().map((element) => {
        const date = $(element).find('label.time').text().trim().slice(1, -1);
        const title = $(element).find('a').attr('title')!;
        const link = $(element).find('a').attr('href')!;

        const formattedDate = parseDate(date);
        return {
            date: formattedDate,
            title,
            link,
        };
    });

    return {
        title: '全国通信专业技术人员职业水平考试',
        description: '全国通信专业技术人员职业水平考试网站最新动态和消息推送',
        link: BASE_URL,
        image: 'https://www.txks.org.cn/asset/image/logo/logo.png',
        item: (await Promise.all(
            contentLinkList.map((item) =>
                cache.tryGet(item.link, async () => {
                    const CONTENT_SELECTOR = '#contentTxt';
                    const { data: contentResponse } = await got(item.link);
                    const contentPage = load(contentResponse);
                    const content = removeFontPresetting(contentPage(CONTENT_SELECTOR).html() || '');
                    return {
                        title: item.title,
                        pubDate: item.date,
                        link: item.link,
                        description: content,
                        category: ['study'],
                        guid: item.link,
                        id: item.link,
                        image: 'https://www.txks.org.cn/asset/image/logo/logo.png',
                        content,
                        updated: item.date,
                        language: 'zh-CN',
                    };
                })
            )
        )) as DataItem[],
        allowEmpty: true,
        language: 'zh-CN',
        feedLink: 'https://rsshub.app/txks/news',
        id: 'https://rsshub.app/txks/news',
    };
};

export const route: Route = {
    path: '/news',
    name: '通信考试动态',
    description: '**注意：** 官方网站限制了国外网络请求，可能需要通过部署在中国大陆内的 RSSHub 实例访问。',
    maintainers: ['PrinOrange'],
    handler,
    categories: ['study'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    radar: [
        {
            title: '全国通信专业技术人员职业水平考试动态',
            source: ['www.txks.org.cn/index/work', 'www.txks.org.cn'],
            target: `/news`,
        },
    ],
    example: '/txks/news',
};
