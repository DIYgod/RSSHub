import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const BASE_URL = 'https://www.ruankao.org.cn/index/work.html';

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
        const date = $(element).find('label.time').text().slice(1, -1);
        const title = $(element).find('a').attr('title')!;
        const link = $(element).find('a').attr('href')!;

        const formattedDate = date ? parseDateInTimezone(date, 8) : undefined;
        return {
            date: formattedDate,
            title,
            link,
        };
    });

    return {
        title: '计算机职业技术资格考试（软考）动态',
        description: '计算机职业技术资格考试（软考）消息推送',
        link: BASE_URL,
        image: 'https://bm.ruankao.org.cn/asset/image/public/logo.png',
        item: await pMap(
            contentLinkList,
            async (item) => {
                const content = await cache.tryGet(item.link, async () => {
                    const CONTENT_SELECTOR = '#contentTxt';
                    const { data: contentResponse } = await got(item.link);
                    const contentPage = load(contentResponse);
                    return removeFontPresetting(contentPage(CONTENT_SELECTOR).html() || '');
                });
                return {
                    title: item.title,
                    pubDate: item.date,
                    link: item.link,
                    description: content,
                    category: ['study'],
                    guid: item.link,
                    id: item.link,
                    image: 'https://bm.ruankao.org.cn/asset/image/public/logo.png',
                    content: { html: content },
                    updated: item.date,
                    language: 'zh-CN',
                };
            },
            { concurrency: 3 }
        ),
        allowEmpty: true,
        language: 'zh-CN',
        feedLink: 'https://rsshub.app/ruankao/news',
        id: 'https://rsshub.app/ruankao/news',
    };
};

export const route: Route = {
    path: '/news',
    name: '软考动态',
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
            title: '计算机职业技术资格考试（软考）动态',
            source: ['www.ruankao.org.cn/index/work', 'www.ruankao.org.cn'],
            target: '/news',
        },
    ],
    example: '/ruankao/news',
};
