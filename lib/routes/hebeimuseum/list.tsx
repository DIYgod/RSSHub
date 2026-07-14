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

    const parts = durationStr.split(/[-—~]+/).map((p) => p.trim()); // currently ——and- is used, add — or ~ for redundency
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
                    let rawText = content('.content.f16').text() || ''; // get descption text from detail page

                    rawText = rawText.replaceAll(/\s+/g, '');

                    const texts = rawText.split(/(?=展览名称：|展览时间：|时间：|展览地点：|展出地点：|地点：)/);

                    // use fullDration to extract startDate and endDate, if fullDuration is not exist, return empty data
                    const fullDuration = texts
                        .find((text) => text.includes('时间：'))
                        ?.replaceAll(/(?:展览)?时间：/g, '')
                        ?.trim();

                    if (!fullDuration) {
                        return {} as Record<string, any>;
                    }

                    let location =
                        texts
                            .find((text) => text.includes('地点：'))
                            ?.replaceAll(/(?:展(?:览|出))?地点：/g, '')
                            ?.trim() || '';

                    const locMatch = location.match(/^.*?展厅/) || [''];

                    location = locMatch[0];

                    let title = texts.find((text) => text.includes('展览名称：'))?.replaceAll('展览名称：', '');

                    // Some exhibition titles are not in the format of "展览名称: xxx", try to extract title from the original list title if the above method failed
                    if (!title) {
                        // try get the title between “” or 《》, if not exist, get the text after '|' in the original list title
                        const quoteMatch = item.title.match(/[“《](.*?)[”》]/);

                        if (quoteMatch) {
                            title = quoteMatch[1];
                        } else if (item.title.includes('|')) {
                            const pipeParts = item.title.split('|');
                            title = pipeParts.at(-1);
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
            title: `${museumName} - 临时展览${isSpecial ? ' - 特展详情' : ''}`,
            link: apiUrl,
            language: 'zh-CN',
            item: items.filter((item) => item.title) as DataItem[],
        };
    },
};
