import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { extractDoc, renderVideo } from './utils';

const rootUrl = 'https://culture.ifeng.com';
const listApi = 'https://shankapi.ifeng.com/season/ishare/getShareListData/1221974/doc/1/ifengnewsh5/getListData';

const findAllDataJson = (scriptText) => {
    const marker = 'var allData = ';
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
};

const extractAllData = ($) => {
    const scripts = $('script')
        .toArray()
        .map((element) => $(element).text());
    const scriptText = scripts.find((text) => text.includes('var allData = '));

    if (!scriptText) {
        return;
    }

    const allDataJson = findAllDataJson(scriptText);
    if (!allDataJson) {
        return;
    }

    return JSON.parse(allDataJson);
};

export const route: Route = {
    path: '/culture',
    categories: ['reading'],
    example: '/ifeng/culture',
    name: '文化读书',
    maintainers: ['jamch'],
    handler,
    radar: [
        {
            source: ['culture.ifeng.com/'],
            target: '/culture',
        },
    ],
};

async function handler() {
    const listResponse = await got(listApi, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });
    const listMatch = listResponse.data.match(/getListData\((.*)\)/);

    if (!listMatch) {
        throw new Error('Failed to parse list data from ifeng API.');
    }

    const listData = JSON.parse(listMatch[1]);
    if (!Array.isArray(listData.data)) {
        throw new TypeError('Unexpected list data format from ifeng API.');
    }

    const list = listData.data.map((entry) => ({
        title: entry.title,
        link: entry.url.startsWith('http') ? entry.url : 'https:' + entry.url,
        pubDate: timezone(parseDate(entry.newsTime), +8),
        newsType: entry.newstype,
    }));

    const items = await Promise.all(
        list.map((entry) =>
            cache.tryGet(entry.link, async () => {
                const detailResponse = await got(entry.link, {
                    headers: {
                        'User-Agent': config.trueUA,
                    },
                });
                const $ = load(detailResponse.data);
                const item: DataItem = {
                    title: entry.title,
                    link: entry.link,
                    pubDate: entry.pubDate,
                };

                const allData = extractAllData($);
                if (!allData) {
                    return item;
                }
                const docData = allData.docData;

                if (entry.newsType === 'video') {
                    item.description = renderVideo(allData.videoInfo);
                } else {
                    const contentList = docData?.contentData?.contentList ?? [];
                    item.description = extractDoc(contentList);
                }

                if (docData?.editorName) {
                    item.author = docData.editorName;
                }

                const keywords = allData.keywords
                    ?.split(',')
                    .map((keyword) => keyword.trim())
                    .filter(Boolean);

                if (keywords?.length) {
                    item.category = keywords;
                }

                return item;
            })
        )
    );

    return {
        title: '凤凰网文化读书',
        link: rootUrl,
        item: items,
    };
}
