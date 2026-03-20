import { type CheerioAPI, load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { extractDoc, renderVideo } from './utils';

const rootUrl = 'https://pl.ifeng.com';

type IfengListData = {
    channel?: Array<{
        logo?: string;
        title?: string;
    }>;
    columnData?: {
        description?: string;
        logo?: string;
        title?: string;
    };
    newsstream?: Array<{
        newsTime?: string;
        thumbnails?: {
            image?: Array<{
                url?: string;
            }>;
        };
        title?: string;
        url?: string;
    }>;
};

type IfengDetailData = {
    docData?: {
        contentData?: {
            contentList?: Array<{
                data?: string | Record<string, unknown>;
                type?: string;
            }>;
        };
        fhhAccountDetail?: {
            catename?: string;
            pcUrl?: string;
        };
        keywords?: string;
        newsTime?: string;
        pcUrl?: string;
        source?: string;
        subscribe?: {
            catename?: string;
        };
        summary?: string;
        title?: string;
    };
    keywords?: string;
    videoInfo?: {
        bigPosterUrl?: string;
        mobileUrl?: string;
    };
};

export const route: Route = {
    path: '/pl/:searchPath?',
    categories: ['new-media'],
    example: '/ifeng/pl',
    parameters: {
        searchPath: '可选栏目路径参数，对应 https://pl.ifeng.com/shanklist/original/:searchPath ，例如 21-35136-',
    },
    radar: [
        {
            source: ['pl.ifeng.com/'],
            target: '/pl',
        },
        {
            source: ['pl.ifeng.com/shanklist/original/:searchPath'],
            target: '/pl/:searchPath',
        },
    ],
    name: '评论',
    maintainers: ['ZHA30'],
    handler,
    description: `| 评论首页 | 栏目页 |
| --- | --- |
| /ifeng/pl | /ifeng/pl/21-35136- |`,
};

function getHeaders(referer?: string) {
    return {
        ...(referer
            ? {
                  Referer: referer,
              }
            : {}),
        'User-Agent': config.trueUA,
    };
}

function getListUrl(searchPath?: string) {
    return searchPath ? `${rootUrl}/shanklist/original/${searchPath}` : `${rootUrl}/`;
}

function extractObjectJson(scriptText: string, marker: string) {
    const markerIndex = scriptText.indexOf(marker);
    if (markerIndex === -1) {
        return;
    }

    const objectStart = scriptText.indexOf('{', markerIndex);
    if (objectStart === -1) {
        return;
    }

    let depth = 0;
    let inString = false;
    let isEscaped = false;

    for (let index = objectStart; index < scriptText.length; index += 1) {
        const currentChar = scriptText[index];

        if (inString) {
            if (isEscaped) {
                isEscaped = false;
            } else if (currentChar === '\\') {
                isEscaped = true;
            } else if (currentChar === '"') {
                inString = false;
            }
            continue;
        }

        if (currentChar === '"') {
            inString = true;
            continue;
        }

        if (currentChar === '{') {
            depth += 1;
        } else if (currentChar === '}') {
            depth -= 1;
            if (depth === 0) {
                return scriptText.slice(objectStart, index + 1);
            }
        }
    }
}

function extractAllData($: CheerioAPI) {
    const scriptText = $('script')
        .toArray()
        .map((element) => $(element).text())
        .find((text) => text.includes('var allData = '));

    if (!scriptText) {
        return;
    }

    const allDataJson = extractObjectJson(scriptText, 'var allData = ');
    if (!allDataJson) {
        return;
    }

    return JSON.parse(allDataJson);
}

function normalizeUrl(url?: string, baseUrl = rootUrl) {
    if (!url) {
        return;
    }

    return new URL(url, baseUrl).href;
}

function parseKeywords(keywords?: string) {
    if (!keywords) {
        return;
    }

    const separator = keywords.includes(',') || keywords.includes('，') ? /[,，]\s*/ : /\s+/;
    const category = keywords
        .split(separator)
        .map((keyword) => keyword.trim())
        .filter(Boolean);

    if (category.length > 0) {
        return category;
    }
}

function extractDescription(detailData: IfengDetailData, $: CheerioAPI) {
    const contentList = detailData.docData?.contentData?.contentList;
    if (contentList?.length) {
        return extractDoc(contentList);
    }

    if (detailData.videoInfo?.mobileUrl) {
        return renderVideo(detailData.videoInfo);
    }

    return detailData.docData?.summary ?? $('meta[name="description"]').attr('content');
}

function buildFeedMeta(listData: IfengListData, currentUrl: string) {
    const columnTitle = listData.columnData?.title;
    const channelTitle = listData.channel?.[0]?.title;

    return {
        description: listData.columnData?.description,
        image: normalizeUrl(listData.columnData?.logo ?? listData.channel?.[0]?.logo),
        link: currentUrl,
        title: columnTitle ? `凤凰网评论 - ${columnTitle}` : `凤凰网${channelTitle ?? '评论'}`,
    };
}

async function handler(ctx) {
    const { searchPath = '' } = ctx.req.param();
    const currentUrl = getListUrl(searchPath);

    const response = await got(currentUrl, {
        headers: getHeaders(rootUrl),
    });
    const $ = load(response.data);
    const listData = extractAllData($) as IfengListData | undefined;

    if (!Array.isArray(listData?.newsstream)) {
        throw new TypeError(`Failed to parse list data from ${currentUrl}.`);
    }

    const list = listData.newsstream
        .map((entry) => ({
            image: normalizeUrl(entry.thumbnails?.image?.[0]?.url),
            link: normalizeUrl(entry.url),
            pubDate: entry.newsTime ? timezone(parseDate(entry.newsTime), +8) : undefined,
            title: entry.title ?? '',
        }))
        .filter((entry): entry is DataItem & { link: string } => Boolean(entry.link && entry.title));

    const items = await Promise.all(
        list.map((entry) =>
            cache.tryGet(entry.link, async () => {
                const detailResponse = await got(entry.link, {
                    headers: getHeaders(currentUrl),
                });
                const $ = load(detailResponse.data);
                const detailData = extractAllData($) as IfengDetailData | undefined;

                if (!detailData) {
                    return entry;
                }

                const detail = detailData.docData;
                const author = detail?.subscribe?.catename ?? detail?.fhhAccountDetail?.catename ?? detail?.source;
                const category = parseKeywords(detailData.keywords ?? detail?.keywords ?? $('meta[name="keywords"]').attr('content'));

                return {
                    ...entry,
                    ...(author
                        ? {
                              author,
                          }
                        : {}),
                    ...(category
                        ? {
                              category,
                          }
                        : {}),
                    description: extractDescription(detailData, $),
                    link: normalizeUrl(detail?.pcUrl ?? entry.link) ?? entry.link,
                    pubDate: detail?.newsTime ? timezone(parseDate(detail.newsTime), +8) : entry.pubDate,
                    title: detail?.title ?? entry.title,
                };
            })
        )
    );

    return {
        ...buildFeedMeta(listData, currentUrl),
        item: items,
    };
}
