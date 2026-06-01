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
    path: '/information/exhibition/:type?',
    categories: ['travel'],
    example: '/chnmus/information/exhibition/special',
    parameters: {
        type: 'Exhibition type, supported values: special（特展详情）. Default: All.',
    },
    name: 'Special Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.chnmus.net/ch/information/exhibition/index.html'],
            target: '/information/exhibition',
        },
    ],

    handler: async (ctx) => {
        const type = ctx.req.param('type');
        const isSpecial = type === 'special';

        const baseUrl = 'https://www.chnmus.net';
        const apiUrl = `${baseUrl}/ch/information/exhibition/index.html`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await got({
            method: 'get',
            url: apiUrl,
        });

        const $ = load(response.data);

        const list = $('.col-md-6.d-flex.fadeInBottom')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const link = $item.attr('href');
                const imgUrlRaw = $item.find('.lazyload').attr('data-bg');
                const listTitle = $item.find('.common-component-box-title').text();

                return {
                    title: listTitle,
                    itemLink: `https:${link}`,
                    imgUrl: `https:${imgUrlRaw}`,
                };
            });

        const items = await Promise.all(
            list.map((item) => {
                // use seperate cache key for special path
                const cacheKey = isSpecial ? `${item.itemLink}-special` : item.itemLink;

                return cache.tryGet(cacheKey, async (): Promise<Record<string, any>> => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.itemLink,
                    });
                    const content = load(detailResponse.data);

                    const pubDateRaw = content('.common-component-content-attribute-item')
                        .toArray()
                        .map((el) => content(el).text())
                        .find((text) => text.includes('发布日期'))!
                        .replaceAll('发布日期:', '')
                        .trim();
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
                    const texts = content('.common-component-content-text p')
                        .toArray()
                        .map((el) => content(el).text());

                    const title = texts.find((text) => text.includes('展览名称：'))?.replaceAll('展览名称：', '');

                    // filter out items without title, for example: https://www.chnmus.net/ch/information/exhibition/details.html?id=7400076083917230080#list
                    if (!title) {
                        return {} as Record<string, any>;
                    }

                    const location = texts
                        .find((text) => text.includes('展览地点：'))!
                        .replaceAll('展览地点：', '')
                        .trim();

                    const fullDuration = texts
                        .find((text) => text.includes('展览时间：') || text.includes('开展时间：'))
                        ?.replaceAll(/(展览|开展)时间：/g, '')
                        ?.trim();

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
