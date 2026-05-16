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
    const cleanStr = duration
        .replaceAll(/\s+/g, '')
        .replaceAll(/（[^）]*）/g, '')
        .trim();

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
        const type = ctx.req.param('type');
        const subType = ctx.req.param('subType');

        const museumName = namespace.zh?.name || namespace.name;
        const baseUrl = 'https://www.chnmuseum.cn';
        let url = `${baseUrl}/zl/`;
        let cleanType = '';
        let titleTag = '展览'; // default with all exhibition info

        if (type) {
            const firstLevel = type.toLowerCase().trim();
            if (subType) {
                // for subtype used in lszl
                cleanType = `${firstLevel}/${subType.toLowerCase().trim()}`;
                url = `${baseUrl}/zl/${cleanType}/`;
                titleTag = titleTagMap[cleanType] || cleanType;
            } else if (firstLevel === 'lszl') {
                // for only type used in lszl, will merge all its subtypes into one feed
                url = `${baseUrl}/zl/lszl/`;
                cleanType = 'lszl';
                titleTag = titleTagMap[cleanType] || cleanType;
            } else {
                // for other type exclude lszl, keep single page for each type
                cleanType = firstLevel;
                url = `${baseUrl}/zl/${cleanType}/`;
                titleTag = titleTagMap[cleanType] || cleanType;
            }
        }

        const itemsToParse: Array<{ element: any; contextUrl: string }> = [];

        if (cleanType === 'lszl' && !subType) {
            // catch total 8 subtype for lszl, and merge them into one feed, because the website doesn't provide a good parent-level page for lszl, we have to crawl all subtypes' page to get complete exhibition list, it's a bit costly but worth it for comprehensive coverage. For other types, we can just crawl the single page directly.
            const subKeys = Object.keys(titleTagMap).filter((key) => key.startsWith('lszl/'));

            const pagesData = await Promise.all(
                subKeys.map(async (subKey) => {
                    try {
                        const targetSubUrl = `${baseUrl}/zl/${subKey}/`;
                        const res = await got(targetSubUrl);
                        return { html: res.data, targetSubUrl };
                    } catch {
                        return null;
                    }
                })
            );

            const seenLinks = new Set<string>();
            for (const page of pagesData) {
                if (!page) {
                    continue;
                }
                const $page = load(page.html);
                const pageElements = $page('ul#div li, ul.cj_hb_list li, li:has(a.recurl)').toArray();

                for (const el of pageElements) {
                    const href = $page(el).find('a.recurl').attr('href') || '';
                    if (href && !seenLinks.has(href)) {
                        seenLinks.add(href);
                        itemsToParse.push({ element: el, contextUrl: page.targetSubUrl });
                    }
                }
            }
        } else {
            // regular catch according to input
            const response = await got(url);
            const $ = load(response.data);
            const pageElements = $('ul#div li, ul.cj_hb_list li, li:has(a.recurl)').toArray();
            for (const el of pageElements) {
                itemsToParse.push({ element: el, contextUrl: url });
            }
        }

        const list = (
            await Promise.all(
                itemsToParse.map(async ({ element, contextUrl }) => {
                    const $item = load(element).root();
                    const aTag = $item.find('a.recurl');

                    if (!aTag.length) {
                        return null;
                    }

                    const rawLink = aTag.attr('href') || '';
                    const itemLink = rawLink && (rawLink.startsWith('.') || rawLink.startsWith('/')) ? new URL(rawLink, contextUrl).href : rawLink ? `${baseUrl}${rawLink}` : baseUrl;

                    // for detailed exhibition page if available, different from base exhibition page.
                    const rawZtzl = aTag.attr('ztzlurl') ? aTag.attr('ztzlurl')!.trim() : '';
                    const exhibitionLink: string = rawZtzl && rawZtzl !== '#' && rawZtzl !== 'undefined' ? (rawZtzl.startsWith('http') ? rawZtzl : `${baseUrl}${rawZtzl.startsWith('/') ? '' : '/'}${rawZtzl}`) : itemLink;

                    // title may not have full display on the page, use the img alt information instead
                    const imgTag = $item.find('img').first();
                    const rawAltTitle = imgTag.attr('alt')?.trim();
                    const title = rawAltTitle || $item.find('div.cj_zxx3 p').text().trim() || 'Title N/A';

                    // if img alt is not available, use zxxx3 instead
                    const rawSrc = imgTag.attr('src') || '';
                    const imgUrl = rawSrc && (rawSrc.startsWith('.') || rawSrc.startsWith('/')) ? new URL(rawSrc, contextUrl).href : rawSrc.startsWith('http') ? rawSrc : '';

                    const location = $item.find('div.cj_zxx1').text().trim();

                    let fullDuration: string = $item.find('div.cj_zxx2 p').text().trim();

                    // Check if the text ends with "..." If so, proceed to fetch the full version.
                    if (fullDuration.endsWith('...')) {
                        fullDuration = (await cache.tryGet(itemLink, async () => {
                            const detailResponse = await got(itemLink);
                            const html = detailResponse.data;
                            const dateRegex = /var\s+qtxszq\s*=\s*"(.*?)";/;
                            const match = html.match(dateRegex);
                            return match && match[1] ? match[1] : fullDuration;
                            // cannot use return match?.[1] ?? fullDuration; if it return "", it will use fullDuration instead, which is not expected, we want to use the matched value even it's empty string, because empty string is also a valid value for fullDuration, it means the exhibition didn't provide any info about duration, while fullDuration with "..." is a sign that there is more info hidden and we should try to fetch it from detail page.
                        })) as string;
                    }

                    const { startDate, endDate } = parseExhibitionDuration(fullDuration);

                    // CHN museum didnot have pubDate on the page, use exhibition startDate instead.
                    // Variable Handling: If the value is `undefined`, it remains `undefined` to facilitate subsequent processing by the Calendar component.
                    const pubDate = startDate ? parseDate(startDate) : undefined;

                    const description = renderToString(
                        <div>
                            {imgUrl && (
                                <>
                                    <img src={imgUrl} />
                                    <br />
                                </>
                            )}
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
                                        {fullDuration.split('\n').map((line, i) => (
                                            <span key={i}>
                                                {line}
                                                <br />
                                            </span>
                                        ))}
                                    </small>
                                </p>
                            )}
                        </div>
                    );

                    return {
                        title,
                        link: exhibitionLink,
                        guid: itemLink, // use href for guid to ensure uniqueness, as title may have duplicates and no pubDate provided by source
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
