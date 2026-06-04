import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

// format the date to YYYY-MM-DD and handle missing year or month
const extractDates = (durationStr: string) => {
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (!durationStr) {
        return { startDate, endDate };
    }

    const parts = durationStr.split(/——|-|—|~/).map((p) => p.trim()); // currently ——and- is used, add — or ~ for redundency
    const startStr = parts[0];
    const endStr = parts[1];

    let startYear: string | undefined;
    let startMonth: string | undefined;

    const startRegex = /(\d{4})年(\d{1,2})月(\d{1,2})日/;
    const startMatch = startStr.match(startRegex);

    if (startMatch) {
        startYear = startMatch[1];
        startMonth = startMatch[2].padStart(2, '0');
        const startDay = startMatch[3].padStart(2, '0');
        startDate = `${startYear}-${startMonth}-${startDay}`;
    }

    if (endStr && startDate) {
        const endRegex = /(?:(\d{4})年)?(?:(\d{1,2})月)?(\d{1,2})日/;
        const endMatch = endStr.match(endRegex);

        if (endMatch) {
            const matchYear = endMatch[1];
            const matchMonth = endMatch[2]?.padStart(2, '0');
            const matchDay = endMatch[3].padStart(2, '0');

            const finalEndYear = matchYear || startYear;
            const finalEndMonth = matchMonth || startMonth;
            const finalEndDay = matchDay;
            endDate = `${finalEndYear}-${finalEndMonth}-${finalEndDay}`;
        }
    }

    return { startDate, endDate };
};

export const route: Route = {
    path: '/list/:type?',
    categories: ['travel'],
    example: '/hebeimuseum/list/special',
    parameters: {
        type: 'Exhibition type, supported values: special（临时展览详情）. Default: All.',
    },
    name: 'Temporary Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.hebeimuseum.org.cn/list-26-1.html'],
            target: '/list',
        },
    ],

    handler: async (ctx) => {
        const type = ctx.req.param('type');
        const isSpecial = type === 'special';

        const baseUrl = 'https://www.hebeimuseum.org.cn';
        const apiUrl = `${baseUrl}/list-26-1.html`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await got({
            method: 'get',
            url: apiUrl,
        });

        const $ = load(response.data);

        const list = $('.main1wrap ul.list li a')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const link = $item.attr('href');
                const imgUrlRaw = $item.find('figure img').attr('src');
                const listTitle = $item.find('p.name').text();

                return {
                    title: listTitle,
                    itemLink: link,
                    imgUrl: `${baseUrl}${imgUrlRaw}`,
                };
            });

        const items = await Promise.all(
            list.map((item) => {
                // use seperate cache key for special path
                const cacheKey = isSpecial ? `${item.itemLink}-special` : (item.itemLink as string);

                return cache.tryGet(cacheKey, async (): Promise<Record<string, any>> => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.itemLink,
                    });
                    const content = load(detailResponse.data);

                    const pubDateRaw = content('.article .info .infowrap img.icon_time').next('span').text().replaceAll('时间：', '').trim();
                    const pubDate = parseDate(pubDateRaw);

                    // Default path: return as news, no detail information for return
                    if (!isSpecial) {
                        return {
                            title: item.title,
                            link: item.itemLink,
                            pubDate,
                            description: renderToString(
                                <div>
                                    <img src={item.imgUrl} />
                                </div>
                            ),
                        } as Record<string, any>;
                    }

                    // Special path to return detail exhibition information
                    // 1. 优先获取正文纯文本，如果正文没有，再用 meta description 兜底
                    let rawText = content('.content.f16').text() || content('meta[name="description"]').attr('content') || '';

                    // 2. 清除富文本里所有的空格、回车、换行（防止它们打断文案）
                    // 此时 rawText 变成了类似："展览时间：2025年...展览地点：河北博物院..." 的紧凑字符串
                    rawText = rawText.replaceAll(/\s+/g, '');

                    // 3. 利用 split 切割成数组（完美适配你的 .find 逻辑）
                    // 注意：我在正则里为你加上了刚刚发现的“展出地点：”
                    const texts = rawText.split(/(?=展览名称：|展览时间：|时间：|展览地点：|展出地点：|地点：)/);

                    // =================================================================
                    // 下面的逻辑几乎还是你原来的配方，只在 location 判断里加了“展出地点”
                    // =================================================================

                    const fullDuration = texts
                        .find((text) => text.includes('展览时间：') || text.includes('时间：'))
                        ?.replaceAll(/展览时间：|时间：/g, '')
                        ?.trim();

                    if (!fullDuration) {
                        return {} as Record<string, any>;
                    }

                    let location = texts
                        // 新增：兼容“展出地点：”
                        .find((text) => text.includes('展览地点：') || text.includes('展出地点：') || text.includes('地点：'))
                        ?.replaceAll(/展览地点：|展出地点：|地点：/g, '')
                        ?.trim();

                    const locMatch = location.match(/^.*?(?:展厅)/);

                    location = locMatch[0];

                    let title = texts
                        .find((text) => text.includes('展览名称：'))
                        ?.replaceAll('展览名称：', '')
                        ?.trim();

                    // 1.2 有展览时间的话，判断有没有 title。没有 title 且外部有 item.title 时，尝试提取
                    if (!title && item.title) {
                        // 优先尝试提取中文 “” 或英文 "" 内的内容
                        const quoteMatch = item.title.match(/[“《](.*?)[”》]/);

                        if (quoteMatch) {
                            title = quoteMatch[1].trim();
                        } else if (item.title.includes('|')) {
                            // 如果没有引号，但包含 '|'，提取 '|' 后面的内容
                            const pipeParts = item.title.split('|');
                            title = pipeParts.at(-1)?.trim();
                        } else {
                            // 兜底逻辑：如果既没有引号也没有 '|'，直接使用原标题以防数据丢失
                            title = item.title.trim();
                        }
                    }

                    const { startDate, endDate } = extractDates(fullDuration || '');
                    const { imgUrl, itemLink } = item;

                    const description = renderToString(
                        <div>
                            <img src={imgUrl} />
                            <br />
                            <p>
                                <b>地点：</b>
                                {location}
                            </p>
                            <p>
                                <b>开展：</b>
                                {startDate ?? '未定/常设'}
                            </p>
                            <p>
                                <b>闭展：</b>
                                {endDate ?? '未定/常设'}
                            </p>
                            {fullDuration && (
                                <p>
                                    <small>原始展期：{fullDuration}</small>
                                </p>
                            )}
                        </div>
                    );

                    return {
                        title,
                        link: itemLink,
                        pubDate,
                        description,
                        _extra: {
                            museumName,
                            title,
                            location,
                            startDate,
                            endDate,
                            itemLink,
                        },
                    } as Record<string, any>;
                }) as Promise<DataItem>;
            })
        );

        return {
            title: `${museumName} - 展览资讯${isSpecial ? ' - 特展详情' : ''}`,
            link: apiUrl,
            language: 'zh-CN',
            item: items.filter((item) => item.title) as DataItem[],
        };
    },
};
