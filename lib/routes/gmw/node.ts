import type { Cheerio } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import { config } from '@/config';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const supportedSubdomains = ['legal', 'news', 'theory', 'guancha'] as const;
const supportedSubdomainSet = new Set<string>(supportedSubdomains);

type ListItem = {
    title?: string;
    link: string;
    pubDate?: string;
    category: string[];
};

const fetchPage = (url: string) =>
    ofetch<string, 'text'>(url, {
        responseType: 'text',
        headers: {
            'User-Agent': config.trueUA,
        },
    });

const normalizeText = (text?: string) => text?.replaceAll(/\s+/g, ' ').trim() ?? '';

const getListUrl = (subdomain: string, nodeId: string) => `https://${subdomain}.gmw.cn/node_${nodeId}.htm`;

const resolveRelativeUrl = (url: string, baseUrl: string) => {
    if (url.startsWith('data:') || url.startsWith('mailto:') || url.startsWith('javascript:') || url.startsWith('#')) {
        return url;
    }

    return new URL(url, baseUrl).href;
};

const resolveRelativeLinks = ($: ReturnType<typeof load>, content: Cheerio<Element>, baseUrl: string) => {
    content.find('img').each((_, element) => {
        const item = $(element);
        const src = item.attr('src');

        if (src) {
            item.attr('src', resolveRelativeUrl(src, baseUrl));
        }
    });

    content.find('a').each((_, element) => {
        const item = $(element);
        const href = item.attr('href');

        if (href) {
            item.attr('href', resolveRelativeUrl(href, baseUrl));
        }
    });
};

const normalizeFeedTitle = (rawTitle?: string) => {
    const parts = (rawTitle ?? '')
        .split('_')
        .map((part) => normalizeText(part))
        .filter(Boolean);

    if (parts.at(-1) === '光明网') {
        parts.pop();
    }

    return parts.join(' - ');
};

const extractCategoryName = (rawTitle?: string) => normalizeText(rawTitle?.split('_')[0]);
const nonContentParagraphPatterns = [/^【上一篇】/, /^【下一篇】/, /^[（(]转载请注明来源/];

const parseStandardList = ($: ReturnType<typeof load>, currentUrl: string, category: string[]) =>
    $('.channelLeftPart .channel-newsGroup li')
        .toArray()
        .map((element) => {
            const item = $(element);
            const linkElement = item.find('.channel-newsTitle > a[href*="content_"], > a[href*="content_"]').first();
            const href = linkElement.attr('href');
            const title = normalizeText(linkElement.text());
            const pubDate = normalizeText(item.find('.channel-newsTime').first().text());

            if (!href) {
                return null;
            }

            return {
                ...(title ? { title } : {}),
                link: new URL(href, currentUrl).href,
                ...(pubDate ? { pubDate } : {}),
                category,
            };
        })
        .filter((item): item is ListItem => item !== null);

const parseCommentaryList = ($: ReturnType<typeof load>, currentUrl: string, category: string[]) => {
    const leadBlock = $('.content_left .select').first();
    const leadHref = leadBlock.children('a[href*="content_"]').first().attr('href');
    const leadPubDate = normalizeText(leadBlock.find('.reading_right').first().text()).replace(/^发布时间[:：]\s*/, '');
    const leadItems = leadHref
        ? [
              {
                  link: new URL(leadHref, currentUrl).href,
                  ...(leadPubDate ? { pubDate: leadPubDate } : {}),
                  category,
              },
          ]
        : [];

    // Also extract extend_box articles from the lead block
    const leadExtendItems = leadBlock
        .find('.extend_box1 span, .extend_box2 span')
        .toArray()
        .map((span) => {
            const inner = $(span).find('a').last();
            const extHref = inner.attr('href');
            const extTitle = normalizeText(inner.text());
            if (!extHref) {
                return null;
            }
            return {
                ...(extTitle ? { title: extTitle } : {}),
                link: new URL(extHref, currentUrl).href,
                category,
            } as ListItem;
        })
        .filter((i): i is ListItem => i !== null);

    const listItems = $('.content_left_main li')
        .toArray()
        .flatMap((element) => {
            const item = $(element);
            const linkElement = item.find('.main_title > a[href*="content_"]').first();
            const href = linkElement.attr('href');
            const title = normalizeText(linkElement.text());
            const pubDate = normalizeText(item.find('.reading_right').first().text()).replace(/^发布时间[:：]\s*/, '');

            const mainItem: ListItem | null = href
                ? {
                      ...(title ? { title } : {}),
                      link: new URL(href, currentUrl).href,
                      ...(pubDate ? { pubDate } : {}),
                      category,
                  }
                : null;

            // Each li contains extend_box1/2 and reading_left with related articles.
            // HTML parsers auto-close <a> before nesting another <a>, so Cheerio
            // produces two sibling <a> tags per span/block; the last one is the real link.
            const extendItems = [...item.find('.extend_box1 span, .extend_box2 span').toArray(), ...item.find('.reading_left').toArray()]
                .map((el) => {
                    const inner = $(el).find('a').last();
                    const extHref = inner.attr('href');
                    const extTitle = normalizeText(inner.text());

                    if (!extHref || extHref === 'ArticleUrlPh') {
                        return null;
                    }

                    return {
                        ...(extTitle ? { title: extTitle } : {}),
                        link: new URL(extHref, currentUrl).href,
                        category,
                    } as ListItem;
                })
                .filter((i): i is ListItem => i !== null);

            return [...(mainItem ? [mainItem] : []), ...extendItems];
        });

    return [...leadItems, ...leadExtendItems, ...listItems];
};

const dedupeItems = (items: ListItem[]) => {
    const seenLinks = new Set<string>();

    return items.filter((item) => {
        if (seenLinks.has(item.link)) {
            return false;
        }

        seenLinks.add(item.link);
        return true;
    });
};

const parseListPage = (html: string, currentUrl: string) => {
    const $ = load(html);
    const rawTitle = normalizeText($('title').first().text());
    const feedTitle = normalizeFeedTitle(rawTitle);
    const categoryName = extractCategoryName(rawTitle) || '光明网';
    const category = [categoryName];
    const items =
        $('.content_left_main .main_title > a[href*="content_"]').length > 0 || $('.content_left .select > a[href*="content_"]').length > 0 ? parseCommentaryList($, currentUrl, category) : parseStandardList($, currentUrl, category);

    // Resolve the next-page link from the pagination bar (unquoted href, e.g. node_11273_2.htm)
    const nextHref = $('#displaypagenum a[href]').first().attr('href');
    const nextPageUrl = nextHref ? new URL(nextHref, currentUrl).href : undefined;

    return {
        feedTitle,
        items: dedupeItems(items),
        nextPageUrl,
    };
};

const extractAuthor = ($: ReturnType<typeof load>, content: Cheerio<Element>) => {
    const paragraphs = content.find('p').slice(0, 3).toArray();

    for (const element of paragraphs) {
        const paragraph = $(element);
        const paragraphText = normalizeText(paragraph.text());

        if (paragraphText.startsWith('光明网评论员：') || paragraphText.startsWith('光明网评论员:')) {
            return '光明网评论员';
        }

        const reporterMatch = paragraphText.match(/^(?:光明日报|本报)?记者[：:\s]+(.+)$/);
        if (reporterMatch?.[1]) {
            paragraph.remove();
            return reporterMatch[1];
        }

        const authorMatch = paragraphText.match(/^作者(?:简介)?[:：]\s*(.+)$/);
        if (authorMatch?.[1]) {
            paragraph.remove();
            return authorMatch[1];
        }
    }
};

const trimTrailingNonContent = ($: ReturnType<typeof load>, content: Cheerio<Element>) => {
    content.find('.m-zbTool, #articleLiability, .liability').remove();

    content.find('p').each((_, element) => {
        const paragraph = $(element);
        const paragraphText = normalizeText(paragraph.text());
        const hasMedia = paragraph.find('img, video, audio, iframe, embed').length > 0;

        if (nonContentParagraphPatterns.some((pattern) => pattern.test(paragraphText)) || (!paragraphText && !hasMedia)) {
            paragraph.remove();
        }
    });

    const children = content.children().toArray().toReversed();

    for (const element of children) {
        const child = $(element);
        const childText = normalizeText(child.text());
        const hasNodeImageLink = child.find('a[href*="node_"] img').length > 0;

        if (nonContentParagraphPatterns.some((pattern) => pattern.test(childText)) || (!childText && hasNodeImageLink)) {
            child.remove();
            continue;
        }

        break;
    }
};

const parsePubDate = (dateText?: string) => {
    if (!dateText) {
        return;
    }

    return timezone(dateText.includes(':') ? parseDate(dateText) : parseDate(dateText, 'YYYY-MM-DD'), +8);
};

const extractDetail = (html: string, link: string, fallbackItem: ListItem) => {
    const $ = load(html);
    const title = normalizeText($('.u-title, #articleID').first().text()) || fallbackItem.title || normalizeFeedTitle(normalizeText($('title').first().text()));
    const content = $('#ContentPh, .u-mainText').first();

    content.find('script, style').remove();
    trimTrailingNonContent($, content);

    const author = extractAuthor($, content);

    resolveRelativeLinks($, content, link);

    const description =
        content
            .html()
            ?.replaceAll(/<!--[\s\S]*?-->/g, '')
            .trim() || undefined;
    const pubDateText = normalizeText($('#articlePubTime, .m-con-time').first().text()) || fallbackItem.pubDate;

    return {
        title,
        link,
        ...(description ? { description } : {}),
        ...(pubDateText ? { pubDate: parsePubDate(pubDateText) } : {}),
        ...(author ? { author } : {}),
        category: fallbackItem.category,
    };
};

async function handler(ctx: Context): Promise<Data> {
    const { subdomain, nodeId } = ctx.req.param();

    if (!supportedSubdomainSet.has(subdomain)) {
        throw new Error(`当前仅支持 ${supportedSubdomains.join('、')} 子站，收到 ${subdomain}。`);
    }

    if (!/^\d+$/.test(nodeId)) {
        throw new Error(`节点 ID 必须是数字，收到 ${nodeId}。`);
    }

    const listUrl = getListUrl(subdomain, nodeId);
    const listHtml = await fetchPage(listUrl);
    const { feedTitle, items: page1Items, nextPageUrl } = parseListPage(listHtml, listUrl);

    // Fetch page 2 when a next-page link is present, to avoid missing articles
    // between polling intervals on paginated list pages.
    const page2Items = nextPageUrl ? await fetchPage(nextPageUrl).then((html) => parseListPage(html, nextPageUrl).items) : [];

    const items = dedupeItems([...page1Items, ...page2Items]);

    if (items.length === 0) {
        throw new Error(`未在 ${listUrl} 找到文章列表，可能是节点不存在或模板暂未支持。`);
    }

    const limit = Number.parseInt(ctx.req.query('limit') ?? '', 10);
    const itemsToFetch = Number.isNaN(limit) ? items : items.slice(0, limit);
    const feedItems = await pMap(
        itemsToFetch,
        (item) =>
            cache.tryGet(item.link, async () => {
                const detailHtml = await fetchPage(item.link);

                return extractDetail(detailHtml, item.link, item);
            }),
        { concurrency: 4 }
    );

    return {
        title: feedTitle || `光明网 ${subdomain} node ${nodeId}`,
        link: listUrl,
        description: `${feedTitle || '光明网栏目'}最新文章`,
        language: 'zh-CN',
        item: feedItems,
    };
}

export const route: Route = {
    path: '/:subdomain/:nodeId',
    categories: ['traditional-media'],
    example: '/gmw/legal/9668',
    parameters: {
        subdomain: '子站名，仅支持 `legal`、`news`、`theory`、`guancha`',
        nodeId: '栏目节点 ID，可从 `node_*.htm` URL 中获取',
    },
    radar: [
        {
            source: ['legal.gmw.cn/node_:nodeId.htm'],
            target: '/gmw/legal/:nodeId',
        },
        {
            source: ['news.gmw.cn/node_:nodeId.htm'],
            target: '/gmw/news/:nodeId',
        },
        {
            source: ['theory.gmw.cn/node_:nodeId.htm'],
            target: '/gmw/theory/:nodeId',
        },
        {
            source: ['guancha.gmw.cn/node_:nodeId.htm'],
            target: '/gmw/guancha/:nodeId',
        },
    ],
    name: '栏目列表',
    maintainers: ['ZHA30'],
    handler,
    url: 'gmw.cn',
    description: '支持光明网 legal、news、theory、guancha 子站的 node 列表页，如滚动播报、光明日报、文章精选、光明网评论员等。',
};
