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
    try {
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
            }))
        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    try {
                        const detailResp = await ofetch(item.link);
                        const $d = cheerio.load(detailResp);
                        return {
                            ...item,
                            description: $d('#articleContent').first().html(),
                            pubDate: parseDate($d('.time').text()) // 添加时间解析
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
            item: items,
        };
    } catch (error) {
        logger.error('抓取失败:', error);
        return {
            title: '手机搜狐新闻',
            link: 'https://m.sohu.com/limit',
            item: [],
        };
    }
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
// 日期解析辅助函数
function parseDate(timeStr?: string) {
    if (!timeStr) {
        return '';
    }
    return new Date(timeStr).toISOString();
}