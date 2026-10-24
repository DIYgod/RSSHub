import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const QJWB_EPAPER_URL = 'https://mqjwb.tidenews.com.cn/epaper/';
const QJWB_ARTICLE_BATCH_SIZE = 10;
const QJWB_CONTENT_METADATA_PATTERN =
    /国内统一连续出版物号|邮发代号|浙江日报报业集团主管主办|QIANJIANG\s*EVENING\s*NEWS|责任编辑\s*[:：]|版式(?:设计)?\s*[:：]|责任检校\s*[:：]|零售价\s*[:：]|出版单位\s*[:：]|本报社址|问询电话|邮政编码|印刷\s*[:：]/i;
const QJWB_ISSUE_COVER_PATTERN = /今日\d+版|农历.{0,12}|第\d+期|发行热线/;
const QJWB_BYLINE_PATTERN = /^(?:本报记者|见习记者|通讯员|视觉中国.*供图|杨晓轩\/摄|本期讲解\s*[:：]|记者\s)/;
const QJWB_PROMOTION_PATTERN = /来“享健康”抽取|扫一扫赢福利|打卡任务|名额等你来赢取|送出.{0,20}福利|成果（项目）展示/;

type QjwbCachedArticle = DataItem | { skip: true };

const normalizeQjwbText = (text: string) => text.replaceAll(/[\s，。！？、；：“”‘’（）()【】《》·—….,:;!?]/g, '');

export const route: Route = {
    path: '/paper/:id?',
    categories: ['traditional-media'],
    example: '/zjol/paper/zjrb',
    parameters: { id: '报纸 id，见下表，默认为 `zjrb`，即浙江日报' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '浙报集团系列报刊',
    maintainers: ['nczitzk'],
    handler,
    description: `| 浙江日报 | 钱江晚报 | 美术报 | 浙江老年报 | 浙江法制报 | 江南游报 |
| -------- | -------- | ------ | ---------- | ---------- | -------- |
| zjrb     | qjwb     | msb    | zjlnb      | zjfzb      | jnyb     |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'zjrb';
    const limit = getRouteLimit(ctx, 100);

    const allowedId = ['zjrb', 'qjwb', 'msb', 'zjlnb', 'zjfzb', 'jnyb'];
    if (!allowedId.includes(id)) {
        throw new InvalidParameterError('id not allowed');
    }

    if (id === 'qjwb') {
        return getQjwbFeed(limit);
    }

    const query = id === 'jnyb' ? 'map[name="PagePicMap"] area' : 'ul.main-ed-articlenav-list li a';

    const rootUrl = `https://${id}.zjol.com.cn`;
    let currentUrl = `${rootUrl}/paperindex.htm`;

    let response = await got({
        method: 'get',
        url: currentUrl,
    });

    const url = response.data.match(/URL=(.*)"/)[1];
    const pubDate = parseDate(url.match(/(\d{4}-\d{2}\/\d{2})/)[1], 'YYYY-MM/DD');

    currentUrl = `${rootUrl}/${url.replace(`/${url.split('/').pop()}`, '')}`;

    response = await got({
        method: 'get',
        url: `${rootUrl}/${url}`,
    });

    const $ = load(response.data);

    const links: string[] = $(query)
        .toArray()
        .map((a) => `${currentUrl}/${$(a).attr('href')}`);

    const sections = await pMap(
        $('#pageLink')
            .slice(1)
            .toArray()
            .map((p) => `${currentUrl}/${$(p).attr('href')}`),
        async (p) => {
            const pageResponse = await got({
                method: 'get',
                url: p,
            });

            const page = load(pageResponse.data);

            return page(query)
                .toArray()
                .map((a) => `${currentUrl}/${page(a).attr('href')}`);
        },
        { concurrency: 3 }
    );
    links.push(...sections.flat());

    const items = await pMap(
        links.filter((a) => (id === 'jnyb' ? a.endsWith('?div=1') : true)).slice(0, limit),
        (link) =>
            cache.tryGet(link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: link,
                });

                const content = load(detailResponse.data);

                const title = content('.main-article-title').text();
                const author = content('.main-article-author').text().trim() || undefined;

                content('.main-article-alltitle').remove();

                return {
                    title,
                    author,
                    pubDate,
                    link: link.split('?', 1)[0],
                    description: content('.main-article-content').html(),
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };
}

const getQjwbFeed = async (limit: number) => {
    const indexResponse = await getQjwbPage(QJWB_EPAPER_URL, 'latest issue index');
    const index = load(indexResponse.data);
    const issueDate = indexResponse.data.match(/\bvar date\s*=\s*["'](\d{4}-\d{2}-\d{2})["']/)?.[1];

    if (!issueDate || Number.isNaN(parseDate(issueDate, 'YYYY-MM-DD', true).getTime())) {
        throw new Error(`Could not find a valid publication date in the Qianjiang Evening News index at ${QJWB_EPAPER_URL}`);
    }

    const pageIds = [
        ...new Set(
            index('a[href*="page/"]')
                .toArray()
                .map((element) => {
                    const href = index(element).attr('href');
                    if (!href) {
                        return;
                    }

                    const pathname = new URL(href, QJWB_EPAPER_URL).pathname;
                    const match = pathname.match(/^\/epaper\/page\/(\d{4}-\d{2}-\d{2})\/(\d+)\/?$/);
                    return match && match[1] === issueDate ? match[2] : undefined;
                })
                .filter((pageId): pageId is string => Boolean(pageId))
        ),
    ];

    const firstPageId = index('map[name^="PagePicMap"]')
        .attr('name')
        ?.match(/^PagePicMap(\d+)$/)?.[1];
    if (pageIds.length === 0 || !firstPageId || !pageIds.includes(firstPageId)) {
        throw new Error(`Could not discover the edition pages for the Qianjiang Evening News issue dated ${issueDate}`);
    }

    const pageArticleIds = await pMap(
        pageIds,
        async (pageId) => {
            const pageResponse = pageId === firstPageId ? undefined : await getQjwbPage(`${QJWB_EPAPER_URL}pagecontent/${issueDate}/${pageId}`, `edition ${pageId} for ${issueDate}`);
            const page = pageResponse ? load(pageResponse.data) : index;

            const articleIds = page('map[name^="PagePicMap"] area')
                .toArray()
                .map((area) => {
                    const href = page(area).attr('href');
                    if (!href) {
                        return;
                    }

                    const pathname = new URL(href, QJWB_EPAPER_URL).pathname;
                    const match = pathname.match(/^\/epaper\/article\/(\d{4}-\d{2}-\d{2})\/(\d+)\/?$/);
                    return match && match[1] === issueDate ? match[2] : undefined;
                })
                .filter((articleId): articleId is string => Boolean(articleId));

            if (articleIds.length === 0) {
                throw new Error(`No article links were found on Qianjiang Evening News edition ${pageId} for ${issueDate}`);
            }

            return articleIds;
        },
        { concurrency: 2 }
    );

    const articleIds = [...new Set(pageArticleIds.flat())];
    if (articleIds.length === 0) {
        throw new Error(`No article links were found for the Qianjiang Evening News issue dated ${issueDate}`);
    }

    const items = await getQjwbArticles(articleIds, issueDate, limit);
    if (items.length === 0) {
        throw new Error(`No readable articles were found for the Qianjiang Evening News issue dated ${issueDate}`);
    }

    return {
        title: '钱江晚报',
        link: QJWB_EPAPER_URL,
        item: items,
    };
};

const getQjwbArticles = (articleIds: string[], issueDate: string, limit: number) => {
    const batchSize = Math.min(articleIds.length, Math.max(limit, QJWB_ARTICLE_BATCH_SIZE));
    return getQjwbArticleBatch(articleIds, issueDate, limit, batchSize, 0, []);
};

const getQjwbArticleBatch = async (articleIds: string[], issueDate: string, limit: number, batchSize: number, startIndex: number, items: DataItem[]): Promise<DataItem[]> => {
    const batchEnd = Math.min(startIndex + batchSize, articleIds.length);
    const cachedArticles = await pMap(articleIds.slice(startIndex, batchEnd), (articleId) => getQjwbArticle(articleId, issueDate), { concurrency: 2 });
    const nextItems = [...items, ...cachedArticles.filter((item): item is DataItem => !('skip' in item))];

    if (nextItems.length >= limit || batchEnd >= articleIds.length) {
        return nextItems.slice(0, limit);
    }

    return getQjwbArticleBatch(articleIds, issueDate, limit, batchSize, batchEnd, nextItems);
};

const getQjwbArticle = (articleId: string, issueDate: string): Promise<QjwbCachedArticle> => {
    const articleUrl = `${QJWB_EPAPER_URL}article/${issueDate}/${articleId}`;

    return cache.tryGet<QjwbCachedArticle>(articleUrl, async () => {
        const response = await getQjwbPage(articleUrl, `article ${articleId} for ${issueDate}`);
        const article = load(response.data);
        const articleDate = response.data.match(/\bvar date\s*=\s*["'](\d{4}-\d{2}-\d{2})["']/)?.[1];

        if (articleDate && articleDate !== issueDate) {
            throw new Error(`Article ${articleId} belongs to ${articleDate}, but its issue index lists it under ${issueDate}`);
        }

        const mainContent = article('.main-content');
        const mainText = mainContent.text();
        const articleTitle = article('.article-title').text();
        const pretitle = article('.article-pretitle').text();
        const subtitle = article('.article-subtitle').text();
        const sourceTitle = [articleTitle, pretitle, subtitle].find((candidate) => candidate.trim());

        if (!articleTitle && /QIANJIANG\s*EVENING\s*NEWS/i.test(mainText)) {
            return { skip: true };
        }

        if (!articleTitle && QJWB_ISSUE_COVER_PATTERN.test(mainText)) {
            return { skip: true };
        }

        if (sourceTitle && /专家号免费送|扫一扫赢福利|成果（项目）展示/.test(sourceTitle)) {
            return { skip: true };
        }

        const author = article('#author')
            .text()
            .replace(/^作者\s*[:：]\s*/, '')
            .trim();
        const paragraphs = mainContent.find('p').toArray();
        const inlineAuthor = paragraphs.map((paragraph) => article(paragraph).text().trim()).find((text) => QJWB_BYLINE_PATTERN.test(text));

        mainContent.find('p').each((_, paragraph) => {
            const element = article(paragraph);
            const text = element.text().trim();
            if (QJWB_BYLINE_PATTERN.test(text) || QJWB_PROMOTION_PATTERN.test(text) || Boolean(author && normalizeQjwbText(text) === normalizeQjwbText(author))) {
                element.remove();
                return;
            }

            const metadataIndex = text.search(QJWB_CONTENT_METADATA_PATTERN);
            if (metadataIndex === 0) {
                element.remove();
            } else if (metadataIndex > 0) {
                const content = text
                    .slice(0, metadataIndex)
                    .replaceAll(/[|│]/g, '')
                    .trim();
                if (content) {
                    element.text(content);
                } else {
                    element.remove();
                }
            }
        });

        const title = sourceTitle || mainContent.find('p').first().text();

        if (!title || /^(?:\d+|[？?])$/.test(title.trim()) || QJWB_BYLINE_PATTERN.test(title.trim())) {
            return { skip: true };
        }

        const fallbackTitle = sourceTitle ? '' : title;
        let remainingTitle = normalizeQjwbText(`${pretitle}${articleTitle}${subtitle || fallbackTitle}`);
        for (const paragraph of mainContent.find('p').toArray()) {
            const paragraphText = normalizeQjwbText(article(paragraph).text());
            if (paragraphText && remainingTitle.startsWith(paragraphText)) {
                article(paragraph).remove();
                remainingTitle = remainingTitle.slice(paragraphText.length);
            } else if (paragraphText) {
                break;
            }
        }

        const descriptionText = mainContent.text();
        const hasSubstantialChineseTitle = /[\u{3400}-\u{9FFF}]/u.test(title) && normalizeQjwbText(title).length >= 10;
        if (normalizeQjwbText(descriptionText).length < 40 && !/天气/.test(title) && !hasSubstantialChineseTitle) {
            return { skip: true };
        }

        const finalAuthor = author || inlineAuthor;
        const description = mainContent.html();
        const link = articleUrl;

        return {
            title,
            link,
            guid: link,
            pubDate: parseDate(`${issueDate}T00:00:00+08:00`),
            ...(finalAuthor && { author: finalAuthor }),
            ...(description && { description }),
        };
    });
};

const getQjwbPage = async (url: string, description: string) => {
    try {
        return await got({
            method: 'get',
            url,
            timeout: config.requestTimeout,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch the Qianjiang Evening News ${description} from ${url}: ${message}`, { cause: error });
    }
};
