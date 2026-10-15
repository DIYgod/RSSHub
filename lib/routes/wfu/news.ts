import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// Adapted from the university news route.

const baseUrl = 'https://www.wfu.edu.cn';
const sizeTitle = '--潍坊学院新闻';

const categoryMap = {
    wyyw: ['/50/list.htm', '潍院要闻'],
    zhxw: ['/52/list.htm', '综合新闻'],
    xszh: ['/xszh/list.htm', '学术纵横'],
};

// Fetch the main article content.
async function loadContent(link) {
    const httpsPattern = /^https:\/\/www\.wfu\.edu\.cn\/.*/;
    if (!httpsPattern.test(link)) {
        return { description: '' };
    }
    const response = await got.get(link);
    const $ = load(response.data);
    const body = $('div.wp_articlecontent');
    if (body.length !== 1) {
        throw new Error(`Article body not found at ${link}`);
    }
    const author = extractArticleAuthor($, body);
    return { description: body.html() ?? undefined, author };
}

function parseFooterAuthor(text: string) {
    const prefix = /^【作者(?:\/编辑)?[：:]\s*/.exec(text);
    if (!prefix) {
        return;
    }
    const remainder = text.slice(prefix[0].length);
    const firstLineBreak = remainder.search(/[\r\n\u{2028}\u{2029}]/u);
    for (const marker of remainder.matchAll(/(?:摄影|审核|编辑|责编|终审)[：:]|】$/g)) {
        let boundary = marker.index;
        if (marker[0] !== '】') {
            while (boundary > 0 && /\s/.test(remainder[boundary - 1])) {
                boundary--;
            }
        }
        if (firstLineBreak === -1 || boundary <= firstLineBreak) {
            const author = remainder.slice(0, boundary);
            return author.replaceAll(/\s+/g, ' ').trim() || undefined;
        }
    }
}

function extractArticleAuthor($, body) {
    const footer = body
        .find('p')
        .filter((_, element) => $(element).text().trim())
        .last();
    const text = footer.text().trim();
    if (!/^【(?:作者(?:\/编辑)?|摄影|审核|编辑|责编|终审)[：:][\s\S]*】$/.test(text)) {
        return;
    }
    const author = parseFooterAuthor(text);
    footer.remove();
    return author || undefined;
}

export const route: Route = {
    path: '/news/:type?',
    categories: ['university'],
    example: '/wfu/news/wyyw',
    parameters: { type: '分类，默认为 `wyyw`，具体参数见下表' },
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
            source: ['news.wfu.edu.cn/'],
            target: '/news',
        },
        {
            source: ['www.wfu.edu.cn/50/list.htm'],
            target: '/news/wyyw',
        },
        {
            source: ['www.wfu.edu.cn/52/list.htm'],
            target: '/news/zhxw',
        },
        {
            source: ['www.wfu.edu.cn/xszh/list.htm'],
            target: '/news/xszh',
        },
    ],
    name: '新闻',
    maintainers: ['cccht'],
    handler,
    url: 'www.wfu.edu.cn/50/list.htm',
    description: `| **内容** | **参数** |
| :------: | :------: |
| 潍院要闻 |   wyyw   |
| 综合新闻 |   zhxw   |
| 学术纵横 |   xszh   |`,
};

function parsePublicationDate(value: string | undefined) {
    if (!value?.trim()) {
        return;
    }
    const calendarDate = /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
    const date = calendarDate ? parseDate(value.trim(), 'YYYY-MM-DD', true) : parseDate(value);
    // UTC midnight encodes a calendar day, not a source publication instant.
    return Number.isFinite(date.getTime()) ? timezone(date, calendarDate ? 0 : 8) : undefined;
}

async function unwrapFirstFailure<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw error instanceof AggregateError ? error.errors[0] : error;
    }
}

async function handler(ctx) {
    // Fetch the first page of the selected category.
    const type = ctx.req.param('type') ?? 'wyyw';
    const listPageUrl = baseUrl + categoryMap[type][0];
    const response = await got({
        method: 'get',
        url: listPageUrl,
    });
    const $ = load(response.data);

    // Read the first-page article list.
    const list = $('div[frag=窗口1]>ul>li');

    const result = await unwrapFirstFailure(
        pMap(
            list.toArray(),
            async (item) => {
                const $item = $(item);
                const itemUrl = new URL($item.find('a').attr('href')!, listPageUrl).href; // Resolve the article URL.
                const itemTitle = $item.find('a>div.txt>h1').text(); // Read the list title.
                const pubDate = parsePublicationDate($item.find('a>div.txt>span.date').text().split('：', 2)[1]); // Read the source publication date.

                // Keep the current list metadata.
                // Keep the title and link.
                const single = {
                    title: itemTitle,
                    pubDate,
                    link: itemUrl,
                    guid: itemUrl,
                };

                // Cache the article body and author separately from list metadata.

                try {
                    const other = await cache.tryGet(`wfu:news:authored-content:${itemUrl}`, () => loadContent(itemUrl));
                    return { ...single, description: other.description, author: other.author };
                } catch (error) {
                    if (error instanceof Error && error.name === 'FetchError') {
                        return single;
                    }
                    throw error;
                }
            },
            { concurrency: 3, stopOnError: false }
        )
    );

    return {
        title: categoryMap[type][1] + sizeTitle,
        link: baseUrl,
        description: categoryMap[type][1] + sizeTitle,
        item: result,
    };
}
