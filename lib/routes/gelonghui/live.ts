import { Route, ViewType } from '@/types';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const baseUrl = 'https://www.gelonghui.com';

// 移除如“格隆汇8月11日｜”这类日期前缀，保留正文（容忍前导空白与多种分隔符）
const stripGelonghuiDatePrefix = (text: string | undefined): string => {
    if (!text) {
        return '';
    }
    // 允许开头空白（含不换行空格），“格隆汇”后月日数字可带空格，分隔符可为 |｜丨:：-–—，后可跟空白
    const prefixPattern = /^[\s\u00A0]*格隆汇\s*\d{1,2}\s*月\s*\d{1,2}\s*日\s*(?:[|｜丨:：\-–—]\s*)?/u;
    return text.replace(prefixPattern, '').trimStart();
};

export const route: Route = {
    path: '/live',
    categories: ['finance', 'popular'],
    view: ViewType.Articles,
    example: '/gelonghui/live',
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
            source: ['gelonghui.com/live', 'gelonghui.com/'],
        },
    ],
    name: '实时快讯',
    maintainers: [],
    handler,
    url: 'gelonghui.com/live',
};

async function handler() {
    const apiUrl = `${baseUrl}/api/live-channels/all/lives/v4`;
    const {
        data: { result },
    } = await got(apiUrl);

    const items = result.map((i) => {
        const sanitizedContent = stripGelonghuiDatePrefix(i.content);
        const sanitizedTitle = stripGelonghuiDatePrefix(i.title || i.content);
        const sanitized = { ...i, content: sanitizedContent };
        return {
            title: sanitizedTitle,
            description: art(path.join(__dirname, 'templates/live.art'), {
                i: sanitized,
            }),
            link: i.route,
            category: i.source,
            pubDate: parseDate(i.createTimestamp, 'X'),
        };
    });

    return {
        title: '格隆汇 - 7×24快讯',
        description: '格隆汇快讯栏目提供外汇投资实时行情,外汇投资交易,外汇投资炒股,证券等内容,实时更新,格隆汇未来将陆续开通台湾、日本、印度、欧洲等市场.',
        image: 'https://cdn.gelonghui.com/static/web/www.ico.la.ico',
        link: `${baseUrl}/live`,
        item: items,
    };
}
