import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://cs.whu.edu.cn';
class ArticleAccessError extends Error {}
function parseCalendarDate(value: string | undefined) {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value.trim(), 'YYYY-MM-DD', true);
    return Number.isFinite(date.getTime()) ? timezone(date, 0) : undefined;
}
function parsePublicationDate(value: string | undefined) {
    if (!value?.trim()) {
        return;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
        return parseCalendarDate(value);
    }
    const date = parseDate(value.trim(), ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm'], true);
    return Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined;
}
export const route: Route = {
    path: '/cs/:type',
    categories: ['university'],
    example: '/whu/cs/2',
    parameters: { type: '公告类型，详见表格' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机学院公告',
    maintainers: ['ttyfly'],
    handler,
    description: `| 公告类型 | 学院新闻 | 学术交流 | 通知公告 | 科研进展 |
| -------- | -------- | -------- | -------- | -------- |
| 参数     | 0        | 1        | 2        | 3        |`,
};
async function handler(ctx) {
    const type = Number.parseInt(ctx.req.param('type'));
    let link;
    switch (type) {
        case 0:
            link = `${baseUrl}/xwdt/xyxw.htm`; // School news
            break;
        case 1:
            link = `${baseUrl}/kxyj/xsjl.htm`; // Academic exchanges
            break;
        case 2:
            link = `${baseUrl}/xwdt/tzgg.htm`; // Notices
            break;
        case 3:
            link = `${baseUrl}/kxyj/kyjz.htm`; // Research progress
            break;
        default:
            throw new Error(`Unknown type: ${type}`);
    }
    const response = await got(link);
    const $ = load(response.data);
    const list = $('div.study ul li')
        .toArray()
        .map(
            (
                item
            ): DataItem & {
                link: string;
            } => {
                const $item = $(item);
                return {
                    title: $item.find('a p').text(),
                    pubDate: parseCalendarDate($item.find('span').text()),
                    link: new URL($item.find('a').attr('href')!, link).href,
                };
            }
        );
    const results = await unwrapFirstFailure(
        pMap(
            list,
            async (item) => {
                try {
                    const detail = await cache.tryGet(`whu:cs:main-content:${item.link}`, async () => {
                        const response = await got(item.link);
                        const $ = load(response.data);
                        if ($('.prompt').length || ($('title').text() === '用户验证' && $('body').text().includes('验证码'))) {
                            throw new ArticleAccessError(`Article access permission or verification required at ${item.link}`);
                        }
                        const content = $('.v_news_content');
                        if (content.length !== 1) {
                            throw new Error(`Article body not found at ${item.link}`);
                        }
                        content.find('script, style').remove();
                        const downloads = $('.content a[href*="news.DownloadAttachUrl"]').filter((_, element) => $(element).parents('.v_news_content').length === 0);
                        content.find('img').each((_, element) => {
                            const image = $(element);
                            const src = image.attr('orisrc') ?? image.attr('src');
                            if (src) {
                                image.attr('src', new URL(src, item.link).href);
                            }
                            image.removeAttr('orisrc');
                            image.removeAttr('vurl');
                        });
                        content
                            .find('a[href]')
                            .add(downloads)
                            .each((_, element) => {
                                const anchor = $(element);
                                const href = anchor.attr('href');
                                if (href) {
                                    anchor.attr('href', new URL(href, item.link).href);
                                }
                            });
                        const attachments = $('<ul></ul>');
                        downloads.each((_, element) => {
                            const attachmentWrapper1 = $('<li></li>');
                            attachmentWrapper1.append(copyContent($(element), $));
                            attachments.append(attachmentWrapper1);
                        });
                        const category = $('meta[name="Keywords"]').attr('content')?.split(/\s+/).filter(Boolean);
                        return {
                            category: category?.length ? category : undefined,
                            description: content.html()! + (downloads.length ? `\n${$.html(attachments)}` : ''),
                            publicationDate: $('meta[name="PubDate"]').attr('content'),
                            listDate: isNullish(item.pubDate) ? undefined : parseDate(item.pubDate).getTime(),
                        };
                    });
                    const listDate = isNullish(item.pubDate) ? undefined : parseDate(item.pubDate).getTime();
                    return {
                        ...item,
                        description: detail.description,
                        category: detail.category,
                        pubDate: detail.listDate === listDate ? (parsePublicationDate(detail.publicationDate) ?? item.pubDate) : item.pubDate,
                    };
                } catch (error) {
                    if (error instanceof ArticleAccessError || (error instanceof Error && error.name === 'FetchError')) {
                        return item;
                    }
                    throw error;
                }
            },
            { concurrency: 3, stopOnError: false }
        )
    );
    const items = results;
    return {
        title: $('title').text(),
        link,
        item: items,
    };
}
async function unwrapFirstFailure<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw error instanceof AggregateError ? error.errors[0] : error;
    }
}
function copyContent<T extends AnyNode>(selection: Cheerio<T>, $: CheerioAPI): Cheerio<T> {
    const nodes = selection.toArray().map((node) => cloneNode(node, true));
    const root = new Document(nodes);
    for (const node of nodes) {
        node.parent = root;
    }
    return $(nodes);
}
function isNullish(value: unknown): value is null | undefined {
    return isOneOf(value, [null, undefined]);
}
function isOneOf<const T>(value: unknown, values: readonly T[]): value is T {
    const candidates: readonly unknown[] = values;
    return candidates.includes(value);
}
