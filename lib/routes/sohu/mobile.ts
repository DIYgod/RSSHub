import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import * as cheerio from 'cheerio';
import logger from '@/utils/logger';

export const route: Route = {
    path: '/mobile',
    categories: ['new-media'],
    example: '/sohu/mobile',
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
            source: ['m.sohu.com/limit'],
            target: '/mobile',
        },
    ],
    name: '首页新闻',
    maintainers: ['asqwe1'],
    handler,
    description: '订阅手机搜狐网的首页新闻',
};

async function handler() {
    const response = await ofetch('https://m.sohu.com/limit');
    // 从HTML中提取JSON数据
    const $ = cheerio.load(response);
    const jsonScript = $('script:contains("WapHomeRenderData")').text();
    const jsonMatch = jsonScript?.match(/window\.WapHomeRenderData\s*=\s*({.*})/s);
    if (!jsonMatch?.[1]) {
        throw new Error('WapHomeRenderData 数据未找到');
    }
    const renderData = JSON.parse(jsonMatch[1]);
    const list = extractPlateBlockNewsLists(renderData)
        .filter((item) => item.id && item.url?.startsWith('//'))
        .map((item) => ({
            title: item.title,
            link: new URL(item.url.split('?')[0], 'https://m.sohu.com').href,
        }));
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResp = await ofetch(item.link);
                    const $d = cheerio.load(detailResp);
                    return {
                        ...item,
                        description: getDescription($d) || item.title,
                        pubDate: extractPubDate($d),
                    };
                } catch (error) {
                    logger.error(`获取详情失败: ${item.link}`, error);
                    return item;
                }
            })
        )
    );
    return {
        title: '手机搜狐新闻',
        link: 'https://m.sohu.com/limit',
        item: items.filter(Boolean),
    };
}

function extractPlateBlockNewsLists(jsonData: any) {
    const result: any[] = [];
    for (const key of Object.keys(jsonData)) {
        if (key.startsWith('PlateBlock')) {
            const plateBlock = jsonData[key];
            // 处理新闻列表
            if (plateBlock?.param?.newsData?.list) {
                result.push(...plateBlock.param.newsData.list);
            }
            // 处理焦点图数据
            if (plateBlock?.param?.focusData?.list) {
                result.push(...plateBlock.param.focusData.list);
            }
            if (plateBlock?.param?.feedData0?.list) {
                result.push(...plateBlock.param.feedData0.list);
            }
            if (plateBlock?.param?.feedData1?.list) {
                result.push(...plateBlock.param.feedData1.list);
            }
        }
    }
    return result;
}

function extractPubDate($: cheerio.CheerioAPI): string {
    const timeElements = [
        '.time',
        '#videoPublicTime',
        'div.channelHeaderContainer div.detail',
    ];
    for (const selector of timeElements) {
        const text = $(selector).first().text().trim();
        if (!text) {
            continue;
        }
        //  ‘奔流 · 昨天23:59 · 2074阅读’
        const dateRegex = /\d{4}[-/]\d{2}[-/]\d{2} \d{2}:\d{2}|昨天\d{1,2}:\d{2}|\d+\s*(?:小时|分钟)前|\d{2}-\d{2} \d{2}:\d{2}|今天\d{1,2}:\d{2}|\d{4}年\d{2}月\d{2}日 \d{2}:\d{2}/;
        const dateMatch = text.match(dateRegex);
        const date = dateMatch?.[0];
        if (date) {
            const newdate = parseDate(date);
            if (newdate) {
                return newdate;
            }
        }
    }
    return new Date().toISOString();
}

// 日期解析辅助函数
function parseDate(timeStr?: string | null): string | null {
    if (!timeStr?.trim()) {
        return null;
    }
    const cleanedStr = timeStr.trim();
    // "2025-04-29 23:32" 或 "2025/04/29 23:32"
    const standardMatch = cleanedStr.match(/^(\d{4}[-/]\d{2}[-/]\d{2} \d{2}:\d{2})$/);
    if (standardMatch) {
        // 替换斜杠为横杠确保兼容性
        const normalizedDateStr = standardMatch[1].replaceAll('/', '-');
        const date = new Date(normalizedDateStr);
        if (!Number.isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    //  "昨天23:59" 格式
    if (cleanedStr.includes('昨天')) {
        const timeMatch = cleanedStr.match(/昨天(\d{1,2}:\d{2})/);
        if (timeMatch) {
            const date = new Date();
            date.setDate(date.getDate() - 1);
            const [hours, minutes] = timeMatch[1].split(':');
            date.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0);
            return date.toISOString();
        }
    }
    //  "n小时前" 格式
    const hoursAgoMatch = cleanedStr.match(/(\d+)\s*小时前/);
    if (hoursAgoMatch) {
        const date = new Date();
        date.setHours(date.getHours() - Number.parseInt(hoursAgoMatch[1]));
        return date.toISOString();
    }
    //  "n分钟前" 格式
    const minsAgoMatch = cleanedStr.match(/(\d+)\s*分钟前/);
    if (minsAgoMatch) {
        const date = new Date();
        date.setMinutes(date.getMinutes() - Number.parseInt(minsAgoMatch[1]));
        return date.toISOString();
    }
    // "04-29 23:32"
    const shortDateMatch = cleanedStr.match(/^(\d{2})-(\d{2}) (\d{2}:\d{2})$/);
    if (shortDateMatch) {
        const [, month, day, time] = shortDateMatch;
        const currentYear = new Date().getFullYear();
        const date = new Date(`${currentYear}-${month}-${day} ${time}`);
        if (!Number.isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    // "今天 HH:MM" 格式
    if (cleanedStr.startsWith('今天')) {
        const timeMatch = cleanedStr.match(/今天(\d{1,2}:\d{2})/);
        if (timeMatch) {
            const [hours, minutes] = timeMatch[1].split(':');
            const date = new Date();
            date.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0);
            return date.toISOString();
        }
    }
    //  "2025年04月29日 23:32"
    const chineseDateMatch = cleanedStr.match(/^(\d{4})年(\d{2})月(\d{2})日 (\d{2}:\d{2})$/);
    if (chineseDateMatch) {
        const [, year, month, day, time] = chineseDateMatch;
        const date = new Date(`${year}-${month}-${day} ${time}`);
        if (!Number.isNaN(date.getTime())) {
            return date.toISOString();
        }
    }
    return null;
}

function getDescription($: cheerio.CheerioAPI) : string | null {
    const selectors = [
        '#articleContent',
        'div.tpl-top-text-content-description',
        'div.title-desc > div.desc > div',
        '#videoTitle',
    ];
    for (const selector of selectors) {
        const content = $(selector).first().html()?.trim();
        if (content && content.length > 6) {
            return content;
        }
    }
    return null;
}
