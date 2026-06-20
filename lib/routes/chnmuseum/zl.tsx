import { load } from 'cheerio';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

const titleTagMap: Record<string, string> = {
    zhanlanyugao: '正在展出', // This is what the website used for current exhibition
    ztzl: '主题展览',
    jbcl: '基本陈列',
    ztcl: '专题展览',
    lszl: '临时展览',
    'lszl/zdztzl': '临时展览 - 主题展览',
    'lszl/dfjpwwxl': '临时展览 - 精品文物展',
    'lszl/lswhxl': '临时展览 - 历史文化展',
    'lszl/kgfjxl': '临时展览 - 考古发现展',
    'lszl/kjcxz': '临时展览 - 科技创新展',
    'lszl/dywhxl': '临时展览 - 地域文化展',
    'lszl/jdmszpxl': '临时展览 - 经典美术展',
    'lszl/gjjlxl': '临时展览 - 国际交流展',
    gbxz: '国博巡展',
};

// Formatting Function: Returns YYYY-MM-DD only if there are 3 valid numeric segments; otherwise, returns undefined.
const formatExhibitionDate = (dateStr: string | undefined): string | undefined => {
    if (!dateStr) {
        return undefined;
    }
    const normalized = dateStr
        .replaceAll(/年|月/g, '-')
        .replaceAll('日', '')
        .replaceAll('/', '-')
        .replaceAll('.', '-');
    const parts = normalized.split('-').filter(Boolean);
    if (parts.length === 3) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    return undefined;
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

    if (cleanStr.startsWith('展至') && allDates.length > 0) {
        endDateRaw = allDates[0];
    } else if (allDates.length >= 2) {
        startDateRaw = allDates[0];
        let rawEnd = allDates[1];
        // Logic to complete the year
        if (!/\d{4}/.test(rawEnd) && startDateRaw) {
            const startYear = startDateRaw.match(/^\d{4}/);
            if (startYear) {
                const sep = startDateRaw.includes('年') ? '年' : startDateRaw.includes('/') ? '/' : '-';
                rawEnd = `${startYear[0]}${sep}${rawEnd}`;
            }
        }
        endDateRaw = rawEnd;
    } else if (allDates.length === 1) {
        if (cleanStr.includes('展至')) {
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

// to concurrent or single-page retrieval according to titletag
const fetchTargetElements = async (cleanType: string, subtype: string | undefined, url: string, baseUrl: string) => {
    const items: Array<{ $item: any; contextUrl: string }> = [];
    // Use a Set to track visited links and filter out duplicate HTML elements directly at the source
    // (e.g., when the same exhibition appears in both the main list and a specific sub-category list).
    const seenLinks = new Set<string>();

    const extractItems = (html: string, contextUrl: string) => {
        const $ = load(html);
        const pageElements = $('ul[id="div"] a.recurl, ul.cj_hb_list a.recurl').toArray();
        for (const el of pageElements) {
            const $item = $(el).closest('li');
            if ($item.length > 0) {
                const href = $(el).attr('href') || '';
                if (href && !seenLinks.has(href)) {
                    seenLinks.add(href);
                    items.push({ $item, contextUrl });
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

// create itemLink
const buildItemLink = (rawLink: string, contextUrl: string, baseUrl: string) => (rawLink ? new URL(rawLink, contextUrl).href : baseUrl);

// create exhibitionLink
const buildExhibitionLink = (rawZtzl: string, itemLink: string, baseUrl: string) => (rawZtzl ? new URL(rawZtzl, baseUrl).href : itemLink);

export const route: Route = {
    path: '/zl/:type?/:subType?',
    categories: ['travel'],
    example: '/chnmuseum/zl/lszl/zdztzl',
    parameters: {
        type: 'Exhibition type, supported values: zhanlanyugao（正在展出）、ztzl（主题展览）、jbcl（基本陈列）、ztcl（专题展览）、lszl（临时展览）、gbxz（国博巡展）. Default: All exhibitions.',
        subType:
            'subtype only works under type lszl（临时展览）, supported values: zdztzl（主题展览）、dfjpwwxl（精品文物展）、lswhxl（历史文化展）、kgfjxl（考古发现展）、kjcxz（科技创新展）、dywhxl（地域文化展）、jdmszpxl（经典美术展）、gjjlxl（国际交流展）',
    },
    // Use Chnmuseum English version channel name
    name: 'Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.chnmuseum.cn/zl/'],
            target: '/zl',
        },
    ],
    handler: async (ctx: Context): Promise<Data> => {
        const type = ctx.req.param('type')?.trim();
        const subtype = ctx.req.param('subType')?.trim();
        const museumName = namespace.zh?.name || namespace.name;
        const baseUrl = 'https://www.chnmuseum.cn';

        const { cleanType, url, titleTag } = resolveRouteConfig(type, subtype, baseUrl);
        const itemsToParse = await fetchTargetElements(cleanType, subtype, url, baseUrl);

        const list = (
            await Promise.all(
                itemsToParse.map(({ $item, contextUrl }) => {
                    const aTag = $item.find('a.recurl');

                    if (!aTag.length) {
                        return null;
                    }

                    const rawLink = aTag.attr('href') || '';
                    const itemLink = buildItemLink(rawLink, contextUrl, baseUrl);

                    return cache.tryGet(itemLink, async () => {
                        // for detailed exhibition page if available, different from base exhibition page.
                        const rawZtzl = aTag.attr('ztzlurl')?.trim() || '';
                        const exhibitionLink = buildExhibitionLink(rawZtzl, itemLink, baseUrl);

                        // title may not have full display on the page, use the img alt information instead
                        const imgTag = $item.find('img');
                        const title = imgTag.attr('alt') || '';

                        const rawSrc = imgTag.attr('src')!;
                        const imgUrl = new URL(rawSrc, contextUrl).href;

                        const location = $item.find('div.cj_zxx1').text().trim();

                        let fullDuration = $item.find('div.cj_zxx2 p').text().trim();

                        if (fullDuration.endsWith('...')) {
                            const detailResponse = await got(itemLink);
                            const match = detailResponse.data.match(/var\s+qtxszq\s*=\s*"(.*?)";/);
                            if (match && match[1]) {
                                fullDuration = match[1];
                            }
                        }

                        const { startDate, endDate } = parseExhibitionDuration(fullDuration);

                        // CHN museum didnot have pubDate on the page, use exhibition startDate instead.
                        // Variable Handling: If the value is `undefined`, it remains `undefined` to facilitate subsequent processing by the Calendar component.
                        const pubDate = startDate ? parseDate(startDate) : undefined;

                        const description = renderToString(
                            <div>
                                {
                                    <>
                                        <img src={imgUrl} />
                                        <br />
                                    </>
                                }
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
                                        <small>
                                            原始展期：
                                            {fullDuration}
                                        </small>
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
                                title,
                                location,
                                startDate, // format: YYYY-MM-DD or '未定/常设'
                                endDate, // format: YYYY-MM-DD or '未定/常设'
                                itemLink,
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
