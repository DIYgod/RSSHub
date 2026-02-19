import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const ROOT_URL = 'https://bfl.ai'; // 根 URL 定义为常量

/**
 * 辅助函数：获取并解析单个公告详情页，提取正文内容，并使用缓存。
 */
const fetchDescription = (item: DataItem): Promise<DataItem> =>
    cache.tryGet(item.link!, async () => {
        const detailPageHtml = await ofetch(item.link!, {
            // 不再手动指定 User-Agent，让 RSSHub 自行处理
        });
        const $detailPage = load(detailPageHtml);
        const detailContentSelector = 'div.max-w-3xl.mx-auto.px-6';
        const fullDescription = $detailPage(detailContentSelector).html()?.trim();

        // 将从列表页获取的 item 与详情页的描述合并后返回
        // 整个对象将被缓存
        return {
            ...item,
            description: fullDescription || item.description, // 如果获取不到全文，则回退到列表页的摘要
        };
    });

/**
 * 主路由处理函数
 */
async function handler(): Promise<Data> {
    const listPageUrl = `${ROOT_URL}/announcements`;

    const listPageHtml = await ofetch(listPageUrl); // 不再手动指定 User-Agent
    const $ = load(listPageHtml);

    const feedTitle = $('head title').text().trim() || 'BFL AI Announcements';
    const feedDescription = $('head meta[name="description"]').attr('content')?.trim() || 'Latest announcements from Black Forest Labs (bfl.ai).';

    const listItemsSelector = 'div.flex.flex-col.max-w-3xl.mx-auto.space-y-8 > a[href^="/announcements/"]';
    const announcementLinks = $(listItemsSelector);

    // 从列表页初步提取每个条目的信息
    const preliminaryItems: DataItem[] = announcementLinks
        .toArray()
        .map((anchorElement) => {
            const $anchor = $(anchorElement);

            const relativeLink = $anchor.attr('href');
            const link = relativeLink ? `${ROOT_URL}${relativeLink}` : undefined;
            const title = $anchor.find('h2[class*="text-xl"]').text().trim();

            const $timeElement = $anchor.find('time');
            const datetimeAttr = $timeElement.attr('datetime');
            const timeText = $timeElement.text().trim();
            const pubDate = datetimeAttr ? parseDate(datetimeAttr) : timeText ? parseDate(timeText) : undefined;

            const summaryDescription = $anchor.find('p[class*="line-clamp-3"]').html()?.trim() || '';
            const author = 'Black Forest Labs';

            // 只有包含有效标题和链接的条目才被认为是初步有效的
            if (!title || !link) {
                return null;
            }

            // 构造初步的 item 对象
            const preliminaryItem: DataItem = {
                title,
                link,
                description: summaryDescription,
                author,
            };

            if (pubDate) {
                preliminaryItem.pubDate = pubDate.toUTCString();
            }

            return preliminaryItem;
        })
        .filter((item): item is DataItem => item !== null && item.link !== undefined);

    // 并行获取所有文章的完整描述
    const items: DataItem[] = await Promise.all(preliminaryItems.map((item) => fetchDescription(item)));

    return {
        title: feedTitle,
        link: listPageUrl,
        description: feedDescription,
        item: items,
        language: 'en',
    };
}

/**
 * 定义并导出RSSHub路由对象
 */
export const route: Route = {
    // 路径相对于命名空间 /bfl，所以完整路径是 /bfl/announcements
    path: '/announcements',
    // 按照要求，只指定一个分类
    categories: ['multimedia'],
    example: '/bfl/announcements',
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
            source: ['bfl.ai/announcements'],
            // target 也要相应修改
            target: '/announcements',
            title: 'Announcements',
        },
    ],
    name: 'Announcements',
    maintainers: ['thirteenkai'],
    handler,
    // url 不包含协议名
    url: 'bfl.ai/announcements',
    description: 'Fetches the latest announcements from Black Forest Labs (bfl.ai). Provides full article content by default with caching.',
};
