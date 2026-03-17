import { load } from 'cheerio';
import type { Item } from 'rss-parser';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const baseUrl = 'https://www.apple.com.cn';
const rootUrl = `${baseUrl}/newsroom/`;
const feedUrl = `${rootUrl}rss-feed.rss`;
const defaultLimit = 20;
const articleEndSelector = '.nr-article-share, .presscontacts-headline, .articles, .section-headline-container';
const galleryControlSelector = '.paddlenav, .paddlenav-arrow, .paddlenav-arrow-next, .paddlenav-arrow-previous, .dotnav, .dotnav-item';
const videoCaptionContainerSelector = '.video-description';
const mediaCaptionContainerSelector = '.image-description, .gallery-caption, .video-description';
const videoControlSelector = '.nr-av-control';
const dangerousProtocols = new Set(['javascript:', 'vbscript:']);

const normalizeText = (text: string) => text.replaceAll(/\s+/g, ' ').trim();

const getMediaCaptionPrefix = ($, element) => ($(element).is(videoCaptionContainerSelector) ? '视频说明：' : '图片说明：');

const resolveUrl = (url: string, pageUrl: string) => {
    const trimmedUrl = url.trim();

    if (trimmedUrl.startsWith('#')) {
        return url;
    }

    try {
        const resolvedUrl = new URL(trimmedUrl, pageUrl);

        if (dangerousProtocols.has(resolvedUrl.protocol)) {
            return;
        }

        return resolvedUrl.href;
    } catch {
        return url;
    }
};

const setResolvedAttribute = ($, element, attributeName: string, pageUrl: string) => {
    const attributeValue = $(element).attr(attributeName);

    if (!attributeValue) {
        return;
    }

    const resolvedValue = resolveUrl(attributeValue, pageUrl);

    if (resolvedValue) {
        $(element).attr(attributeName, resolvedValue);
    } else {
        $(element).removeAttr(attributeName);
    }
};

const resolveSrcset = (srcset: string, pageUrl: string) =>
    srcset
        .split(',')
        .map((entry) => {
            const [url, ...descriptors] = entry.trim().split(/\s+/);

            if (!url) {
                return '';
            }

            const resolvedUrl = resolveUrl(url, pageUrl);

            if (!resolvedUrl) {
                return '';
            }

            return [resolvedUrl, ...descriptors].join(' ');
        })
        .filter(Boolean)
        .join(', ');

const removeDuplicateMediaDescriptions = ($, node, bodyTexts: Set<string>) => {
    const $node = $(node);

    $(mediaCaptionContainerSelector, $node).each((_, element) => {
        const description = $(element);
        const descriptionClone = description.clone();

        descriptionClone.find('a, button').remove();

        const descriptionText = normalizeText(descriptionClone.text());

        if (!descriptionText || bodyTexts.has(descriptionText)) {
            description.remove();
        }
    });
};

const formatMediaDescriptions = ($, node) => {
    const $node = $(node);

    $(mediaCaptionContainerSelector, $node).each((_, element) => {
        const description = $(element);
        const captions = description
            .find('.image-caption')
            .toArray()
            .map((caption) => normalizeText($(caption).text()))
            .filter(Boolean);

        if (captions.length === 0) {
            description.remove();

            return;
        }

        const figcaption = $('<figcaption></figcaption>').html(captions.map((caption) => `<small><em>${getMediaCaptionPrefix($, element)}${caption}</em></small>`).join('<br>'));

        description.replaceWith(figcaption);
    });
};

const removeVideoControls = ($, node) => {
    const $node = $(node);

    $(videoControlSelector, $node).remove();
    $node.find('.video-container a').each((_, element) => {
        const link = $(element);
        const hasMediaContent = link.find('img, picture, video, source, figcaption').length > 0;

        if (!normalizeText(link.text()) && !hasMediaContent) {
            link.remove();
        }
    });
    $node.find('.autoplay-controls-container').each((_, element) => {
        const container = $(element);

        container.replaceWith(container.html() ?? '');
    });
};

const absolutizeArticleNode = ($, node, pageUrl: string, bodyTexts: Set<string>) => {
    const $node = $(node);

    if ($node.is(galleryControlSelector)) {
        $node.remove();

        return;
    }

    $node.find('script, style').addBack('script, style').remove();
    $(galleryControlSelector, $node).remove();
    removeVideoControls($, node);
    $node.find('[download]').remove();
    $node.find('.image-description > div:empty, .gallery-caption > div:empty, .video-description > div:empty').remove();
    removeDuplicateMediaDescriptions($, node, bodyTexts);
    formatMediaDescriptions($, node);
    $(mediaCaptionContainerSelector, $node).each((_, element) => {
        if (normalizeText($(element).text()) === '' && $(element).children().length === 0) {
            $(element).remove();
        }
    });

    $node
        .find('a[href]')
        .addBack('a[href]')
        .each((_, element) => setResolvedAttribute($, element, 'href', pageUrl));

    $node
        .find('img[src], source[src], video[src]')
        .addBack('img[src], source[src], video[src]')
        .each((_, element) => setResolvedAttribute($, element, 'src', pageUrl));

    $node
        .find('img[srcset], source[srcset]')
        .addBack('img[srcset], source[srcset]')
        .each((_, element) => {
            const srcset = $(element).attr('srcset');

            if (srcset) {
                $(element).attr('srcset', resolveSrcset(srcset, pageUrl));
            }
        });

    $node
        .find('video[poster]')
        .addBack('video[poster]')
        .each((_, element) => setResolvedAttribute($, element, 'poster', pageUrl));
};

const extractArticleDescription = ($, pageUrl: string) => {
    const article = $('.article').first();

    if (!article.length) {
        return;
    }

    const articleChildren = article.children().toArray();
    const headerIndex = articleChildren.findIndex((node) => $(node).is('.article-header'));
    const startIndex = headerIndex === -1 ? 0 : headerIndex + 1;
    const endIndex = articleChildren.findIndex((node, index) => index >= startIndex && $(node).is(articleEndSelector));
    const contentNodes = articleChildren.slice(startIndex, endIndex === -1 ? undefined : endIndex);

    if (contentNodes.length === 0) {
        return;
    }

    const bodyTexts = new Set(
        contentNodes
            .flatMap((node) =>
                $(node)
                    .find('.pagebody-copy')
                    .addBack('.pagebody-copy')
                    .toArray()
                    .map((element) => normalizeText($(element).text()))
            )
            .filter(Boolean)
    );

    for (const node of contentNodes) {
        absolutizeArticleNode($, node, pageUrl, bodyTexts);
    }

    return contentNodes.map((node) => $.html(node) ?? '').join('');
};

const fetchArticle = (item: Item & { link: string }) =>
    cache.tryGet(item.link, async () => {
        const response = await ofetch(item.link);
        const $ = load(response);
        const category = $('.category-eyebrow__category').first().text();
        const fallbackDate = $('.category-eyebrow__date').first().text();
        const description = extractArticleDescription($, item.link);
        const ogTitle = $('meta[property="og:title"]').attr('content');
        const ogImage = $('meta[property="og:image"]').attr('content');
        const pubDate = item.isoDate ?? item.pubDate;

        return {
            title: ogTitle ?? item.title ?? item.link,
            link: item.link,
            description: description ?? item.content ?? item.contentSnippet,
            pubDate: pubDate ? parseDate(pubDate) : fallbackDate ? parseDate(fallbackDate, 'YYYY 年 M 月 D 日') : undefined,
            author: item.author ?? 'Apple Newsroom',
            category: category ? [category] : item.categories,
            image: ogImage ?? item.enclosure?.url,
        };
    });

async function handler(ctx) {
    const limit = Math.max(Number.parseInt(ctx.req.query('limit') ?? '', 10) || defaultLimit, 1);
    const feedResponse = await ofetch(feedUrl, {
        parseResponse: (text) => text,
    });
    const feed = await parser.parseString(feedResponse);
    const items = await Promise.all(
        (feed.items as Item[])
            .slice(0, limit)
            .filter((item): item is Item & { link: string } => Boolean(item.link))
            .map((item) => fetchArticle(item))
    );

    return {
        title: 'Apple Newsroom (中国大陆)',
        link: rootUrl,
        feedLink: feedUrl,
        description: 'Apple 新闻中心是 Apple 新闻的来源。阅读新闻稿、获取最新消息、观看视频和下载图片。',
        item: items,
        language: 'zh-CN',
    };
}

export const route: Route = {
    path: '/newsroom',
    name: 'Newsroom (中国大陆)',
    url: 'www.apple.com.cn/newsroom',
    maintainers: ['LinxHex'],
    example: '/apple/newsroom',
    description: `The official source for news about Apple, from Apple. Read press releases, get updates, watch video and download images.`,
    categories: ['new-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.apple.com.cn/newsroom', 'www.apple.com.cn/newsroom/:year/:month/:slug'],
            target: '/newsroom',
        },
    ],
    view: ViewType.Articles,
    zh: {
        path: '/newsroom',
        name: '新闻中心（中国大陆）',
        url: 'www.apple.com.cn/newsroom',
        maintainers: ['LinxHex'],
        example: '/apple/newsroom',
        description: `Apple 新闻中心是 Apple 新闻的来源。阅读新闻稿、获取最新消息、观看视频和下载图片。`,
        handler,
    },
    handler,
};
