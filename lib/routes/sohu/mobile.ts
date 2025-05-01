import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import * as cheerio from 'cheerio';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';

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

                    let description = '';
                    let pubDate = '';
                    if (item.link.includes('/xtopic/')) {
                        const fullArticleUrl = $d('.tpl-top-text-item-content').prop('href')?.split('?')[0]?.replace('www.sohu.com/', 'm.sohu.com/');
                        const response = await ofetch(`https:${fullArticleUrl}`);
                        const $ = cheerio.load(response);
                        description = getDescription($);
                        pubDate = extractPubDate($);
                    }

                    return {
                        ...item,
                        description: description || getDescription($d) || item.title,
                        pubDate: pubDate || extractPubDate($d),
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
    const timeElements = ['.time', '#videoPublicTime'];
    let date;
    for (const selector of timeElements) {
        const text = $(selector).first().text().trim();
        if (!text) {
            continue;
        }

        date = parseDate(text);
        if (date) {
            return date;
        }
    }

    const img = $('meta[name="share_img"]')
        .toArray()
        .map((i) => $(i).attr('src'))
        .find((i) => i.includes('images01'));
    date = img ? parseDate(img?.match(/images01\/(\d{8})\//i)?.[1]) : '';
    if (date) {
        return date;
    }
}

function getDescription($: cheerio.CheerioAPI): string | null {
    const content = $('#articleContent');
    if (content.length) {
        return content.first().html()?.trim();
    }
    const video = $('#videoPlayer div');
    if (video.length) {
        return `<video controls preload="auto" poster="${video.attr('data-thumbnail')}"><source src="${video.attr('data-url')}" /></video>`;
    }
    const imageList = $('script:contains("imageList")').text();
    if (imageList) {
        const list = JSON.parse(imageList.match(/(\[.*\])/s)?.[1].replaceAll(/("description": ".*"),/g, '$1') || '[]');
        return list.map((item: any) => `<img src="${item.url}" alt="${item.description || ''}" />`).join('');
    }
    return '';
}
