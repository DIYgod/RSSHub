import { load } from 'cheerio';
import dayjs from 'dayjs';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

const titleTagMap: Record<string, string> = {
    zhanlanyugao: '正在展出',
    jbcl: '基本陈列',
    ztcl: '专题展览',
    lszl: '临时展览',
    'lszl/lswh': '临时展览 - 历史文化',
    'lszl/gjjl': '临时展览 - 国际交流',
    'lszl/zdzt': '临时展览 - 重大主题',
    'lszl/yscx': '临时展览 - 艺术创新',
    gjzl: '国家展览',
    gbxz: '国博巡展',
};

// Formatting Function: Returns YYYY-MM-DD when there are 3 valid numeric segments that are formatted by parseExhibitionDate; otherwise, returns undefined.
const formatExhibitionDate = (dateStr: string | undefined): string | undefined => {
    if (!dateStr) {
        return undefined;
    }
    const normalized = dateStr.replaceAll(/[年月/.]/g, '-').replaceAll('日', '');
    const d = dayjs(normalized);
    return d.format('YYYY-MM-DD');
};

const parseExhibitionDuration = (duration: string) => {
    if (!duration) {
        return { startDate: undefined, endDate: undefined };
    }

    // Remove all spaces and parentheses to prevent regex matching from breaking
    const cleanStr = duration.replaceAll(/\s+/g, '').replaceAll(/（[^）]*）/g, '');

    // Match YYYY-MM-DD or MM-DD
    const dateRegex = /(\d{4}[./年-]\d{1,2}[./月-]\d{1,2}日?)|(\d{1,2}[./月-]\d{1,2}日?)/g;
    const allDates = cleanStr.match(dateRegex) || [];

    let startDateRaw: string | undefined;
    let endDateRaw: string | undefined;

    if (allDates.length >= 2) {
        startDateRaw = allDates[0];
        let rawEnd = allDates[1];
        // Logic to complete the year
        if (!/\d{4}/.test(rawEnd) && startDateRaw) {
            const startYear = startDateRaw.match(/^\d{4}/);
            if (startYear?.[0]) {
                rawEnd = `${startYear[0]}${startDateRaw[4]}${rawEnd}`;
            }
        }
        endDateRaw = rawEnd;
    } else if (allDates.length === 1) {
        if (cleanStr.includes('闭展')) {
            // e.g. "2025年2月16日闭展"
            endDateRaw = allDates[0];
        } else {
            startDateRaw = allDates[0];
        }
    }

    return {
        startDate: formatExhibitionDate(startDateRaw),
        endDate: formatExhibitionDate(endDateRaw),
    };
};

// to identify the route config and titletag based on type and subtype, this function is used in both route handler and radar to ensure consistency
const resolveRouteConfig = (type: string | undefined, subtype: string | undefined, baseUrl: string) => {
    let url = `${baseUrl}/zl/`;
    let cleanType = '';

    if (type) {
        cleanType = subtype ? `${type}/${subtype}` : type;
        url = `${baseUrl}/zl/${cleanType}/`;
    }
    return {
        cleanType,
        url,
        titleTag: titleTagMap[cleanType] || '展览',
    };
};

// create itemLink
const buildItemLink = (rawLink: string, contextUrl: string, baseUrl: string) => (rawLink ? new URL(rawLink, contextUrl).href : baseUrl);

// create exhibitionLink
const buildExhibitionLink = (rawZtzl: string, itemLink: string, baseUrl: string) => (rawZtzl ? new URL(rawZtzl, baseUrl).href : itemLink);

// to concurrent or single-page retrieval according to titletag
const fetchTargetElements = async (cleanType: string, subtype: string | undefined, url: string, baseUrl: string) => {
    const items: Array<{ $item: any; contextUrl: string; itemLink: string; exhibitionLink: string; rawZtzl: string }> = [];
    // Use a Set to track visited links and filter out duplicate HTML elements directly at the source
    // (e.g., when the same exhibition appears in both the main list and a specific sub-category list).
    const seenLinks = new Set<string>();

    const extractItems = (html: string, contextUrl: string) => {
        const $ = load(html);
        const selectors = ['ul[id="div"] > li > a', 'li.scale_imgs > a'].join(', ');

        const pageElements = $(selectors).not('.zl_lszl_list *').toArray();

        for (const el of pageElements) {
            const $item = $(el).closest('li');
            if ($item.length > 0) {
                const rawLink = $(el).attr('href') || '';
                const rawZtzl = $(el).attr('ztzlurl')?.trim() || ''; // some exhibition links have a separate detailed page, use ztzlurl to get the detailed exhibition link if available

                // Use exhibitionLink to remove the repeat ones
                const itemLink = buildItemLink(rawLink, contextUrl, baseUrl);
                const exhibitionLink = buildExhibitionLink(rawZtzl, itemLink, baseUrl);

                if (exhibitionLink && !seenLinks.has(exhibitionLink)) {
                    seenLinks.add(exhibitionLink);
                    items.push({ $item, contextUrl, itemLink, exhibitionLink, rawZtzl });
                }
            }
        }
    };

    if (cleanType === 'lszl') {
        const subKeys = Object.keys(titleTagMap).filter((key) => key.startsWith('lszl/'));
        const pagesData = await Promise.all(
            subKeys.map(async (subKey) => {
                const targetSubUrl = `${baseUrl}/zl/${subKey}/`;
                const res = await got(targetSubUrl);
                return { html: res.data, targetSubUrl };
            })
        );
        for (const page of pagesData) {
            extractItems(page.html, page.targetSubUrl);
        }
    } else {
        const response = await got(url);
        extractItems(response.data, url);
    }
    return items;
};

export const route: Route = {
    path: '/zl/:type?/:subType?',
    categories: ['travel'],
    example: '/chnmuseum/zl/lszl/zdzt',
    parameters: {
        type: 'Exhibition type, supported values: zhanlanyugao（正在展出）、jbcl（基本陈列）、ztcl（专题展览）、lszl（临时展览）、gjzl（国家展览）、gbxz（国博巡展）. Default: All exhibitions.',
        subType: 'subtype only works under type lszl（临时展览）, supported values: zdzt（重大主题）、lswh（历史文化）、yscx（艺术创新）、gjjl（国际交流）',
    },
    name: 'Exhibitions', // Use Chnmuseum English version channel name
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.chnmuseum.cn/zl/'],
            target: '/zl',
        },
    ],
    handler: async (ctx: Context): Promise<Data> => {
        const type = ctx.req.param('type');
        const subtype = ctx.req.param('subType');
        const museumName = namespace.zh?.name || namespace.name;
        const baseUrl = 'https://www.chnmuseum.cn';

        const { cleanType, url, titleTag } = resolveRouteConfig(type, subtype, baseUrl);
        const itemsToParse = await fetchTargetElements(cleanType, subtype, url, baseUrl);

        const list = (
            await Promise.all(
                itemsToParse.map(({ $item, contextUrl }) => {
                    const aTag = $item.find('a').first();

                    const rawLink = aTag.attr('href') || '';
                    const itemLink = buildItemLink(rawLink, contextUrl, baseUrl);

                    return cache.tryGet(itemLink, async () => {
                        // for detailed exhibition page if available, different from base exhibition page.
                        const rawZtzl = aTag.attr('ztzlurl')?.trim() || '';
                        const exhibitionLink = buildExhibitionLink(rawZtzl, itemLink, baseUrl);

                        // title may not have full display on the page, use the img alt information instead
                        const imgTag = $item.find('img');
                        let title = $item.find('.hide_title').text() || '';

                        const rawSrc = imgTag.attr('src')!;
                        const imgUrl = new URL(rawSrc, contextUrl).href;

                        const hideBox = $item.find('.hide_box');
                        const hideBoxes = hideBox.toArray().map((_, i) => hideBox.eq(i));
                        const findValue = (keyword: string) =>
                            hideBoxes
                                .find((box) => box.find('p').first().text().includes(keyword))
                                ?.find('p')
                                .last()
                                .text()
                                .trim() ?? '';

                        const location = findValue('地点');
                        let fullDuration = findValue('展期');

                        if (!title || title.endsWith('...')) {
                            const detailResponse = await got(itemLink);
                            const $detail = load(detailResponse.data);
                            const detailTitle = $detail('.crumb_mod_box .title').text();
                            title =
                                detailTitle ||
                                $detail('title')
                                    .text()
                                    .replace(/-?\s*中国国家博物馆/, '');

                            if (!fullDuration) {
                                const textDuration = $detail('li, strong, p')
                                    .toArray()
                                    .map((el) => $detail(el).text().trim())
                                    .find((text) => text.startsWith('展期：') || text.includes('闭展'))
                                    ?.replace('展期：', '')
                                    .trim();
                                const regexDuration = detailResponse.data.match(/var\s+qtxszq\s*=\s*"(.*?)";/)?.[1];
                                fullDuration = textDuration || regexDuration || '';
                            }
                        }

                        const { startDate, endDate } = parseExhibitionDuration(fullDuration);

                        // CHN museum didnot have pubDate on the page, use exhibition startDate instead.
                        const pubDate = startDate ? parseDate(startDate) : undefined;

                        const description = renderToString(
                            <div>
                                <img src={imgUrl} />
                                <br />
                                <p>
                                    <b>地点：</b>
                                    {location || '参考详情'}
                                </p>
                                <p>
                                    <b>开展：</b>
                                    {startDate || '未定/常设'}
                                </p>
                                <p>
                                    <b>闭展：</b>
                                    {endDate || '未定/常设'}
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
                            link: exhibitionLink,
                            // Force the guid to be the unique absolute path (itemLink) instead of relying on title hash.
                            // This ensures uniqueness and prevents RSS readers from misjudging or duplicating items, as titles may repeat and exact pubDates are not provided.
                            guid: itemLink,
                            pubDate,
                            description,
                            // For further .ics file processing
                            _extra: {
                                museumName,
                                location,
                                startDate,
                                endDate,
                            },
                        } as DataItem;
                    }) as Promise<DataItem>;
                })
            )
        ).filter((i): i is DataItem => i !== null);

        return {
            title: `${museumName} - ${titleTag}`,
            link: url,
            language: 'zh-CN',
            item: list,
        };
    },
};
