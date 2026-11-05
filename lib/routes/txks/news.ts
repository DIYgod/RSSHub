import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.txks.org.cn/index/work.html';

function getPublicationDate(value: string): Date | undefined {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return;
    }
    const date = parseDate(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().startsWith(`${value}T`) ? date : undefined;
}

function removeFontPresetting($: CheerioAPI): string {
    const content = $('#contentTxt');
    if (content.length === 0) {
        throw new Error('The source article does not contain its main content element');
    }
    content.find('[style]').each((_, element) => {
        const style = $(element).attr('style') || '';
        const cleanedStyle = style.replaceAll(/font-family:[^;]*;?/gi, '').trim();
        if (cleanedStyle) {
            $(element).attr('style', cleanedStyle);
        } else {
            $(element).removeAttr('style');
        }
    });
    content.find('style').each((_, styleElement) => {
        const cssText = $(styleElement).html() || '';
        $(styleElement).html(cssText.replaceAll(/font-family:[^;]*;?/gi, ''));
    });
    return content.html() || '';
}

async function getArticleItem(item: { date?: Date; title: string; link: string }): Promise<DataItem> {
    const detail = await cache.tryGet<Pick<DataItem, 'description' | 'content'>>(`txks:article:${item.link}`, async () => {
        const { data: contentResponse } = await got(item.link);
        const content = removeFontPresetting(load(contentResponse));
        return { description: content, content: { html: content } };
    });
    return {
        title: item.title,
        pubDate: item.date,
        link: item.link,
        description: detail.description,
        guid: item.link,
        id: item.link,
        content: detail.content,
        language: 'zh-CN',
    };
}

const handler: Route['handler'] = async () => {
    // Fetch the index page
    const { data: listResponse } = await got(baseUrl);
    const $ = load(listResponse);

    // Select all list items containing news information
    const itemSelector = 'ul[class*="newsList"] > li';
    const listItems = $(itemSelector);

    // Map through each list item to extract details
    const contentLinkList = listItems.toArray().map((element) => {
        const date = $(element).find('label.time').text().trim().slice(1, -1);
        const title = $(element).find('a').attr('title')!;
        const link = $(element).find('a').attr('href')!;

        const formattedDate = getPublicationDate(date);
        return {
            date: formattedDate,
            title,
            link,
        };
    });

    return {
        title: '全国通信专业技术人员职业水平考试',
        description: '全国通信专业技术人员职业水平考试网站最新动态和消息推送',
        link: baseUrl,
        image: 'https://www.txks.org.cn/asset/image/logo/logo.png',
        item: await pMap(contentLinkList, getArticleItem, { concurrency: 3 }),
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
            source: ['www.txks.org.cn/index/work', 'www.txks.org.cn', 'www.txks.org.cn/index/work.html'],
            target: '/news',
        },
    ],
    example: '/txks/news',
};
