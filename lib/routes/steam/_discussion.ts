import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { AnyNode } from 'domhandler';
import { escape } from 'entities';

import type { DataItem } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const steamCommunityUrl = 'https://steamcommunity.com';
export const defaultDiscussionFeature = '0';

const invalidForumId = '18446744073709551615';
const topicPageSize = 15;

type ForumMetadata = {
    forumName: string;
};

type DiscussionAuthor = {
    name: string;
    url?: string;
};

export type DiscussionIdentity = {
    appId: string;
    feature: string;
};

export type TopicIdentity = DiscussionIdentity & {
    topicId: string;
};

export type DiscussionListTopic = TopicIdentity & {
    title: string;
    link: string;
    preview?: string;
    authorName?: string;
    sourceIndex: number;
};

export type DiscussionListPage = {
    appName: string;
    forumName: string;
    topics: DiscussionListTopic[];
};

export type DiscussionTopicPage = {
    appName: string;
    forumName: string;
    title: string;
    originalPost: DataItem;
};

export type DiscussionThreadPagination = {
    replyCount: number;
    start: number;
    pageSize: number;
};

export type DiscussionThreadPage = DiscussionTopicPage & {
    replies: DataItem[];
    pagination: DiscussionThreadPagination;
};

type Initialization = {
    data: unknown;
    trailingSource: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const getErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const parsePositiveId = (value: string | undefined, label: string): string => {
    if (!value || !/^[1-9]\d*$/.test(value)) {
        throw new Error(`Invalid Steam ${label} "${value ?? ''}": expected a positive integer`);
    }
    return value;
};

export const parseAppId = (value: string | undefined): string => {
    const appId = parsePositiveId(value, 'app ID');
    if (!Number.isSafeInteger(Number(appId))) {
        throw new TypeError(`Invalid Steam app ID "${appId}": value exceeds the supported integer range`);
    }
    return appId;
};

export const parseFeature = (value: string | undefined): string => {
    const feature = value ?? defaultDiscussionFeature;
    if (!/^(?:0|[1-9]\d*)$/.test(feature) || !Number.isSafeInteger(Number(feature))) {
        throw new Error(`Invalid Steam discussion feature "${feature}": expected a non-negative integer`);
    }
    return feature;
};

export const parseTopicId = (value: string | undefined): string => parsePositiveId(value, 'discussion topic ID');

export const buildDiscussionListUrl = (appId: string, feature?: string): string => `${steamCommunityUrl}/app/${appId}/discussions/${feature === undefined ? '' : `${feature}/`}`;

export const buildDiscussionTopicUrl = ({ appId, feature, topicId }: TopicIdentity): string => `${steamCommunityUrl}/app/${appId}/discussions/${feature}/${topicId}/`;

export const buildDiscussionTopicCacheKey = ({ appId, feature, topicId }: TopicIdentity): string => `steam:discussion:${appId}:${feature}:${topicId}`;

export const fetchSteamDiscussionPage = async (url: string): Promise<string> => {
    const localizedUrl = new URL(url);
    localizedUrl.searchParams.set('l', 'english');
    const { data } = await got(localizedUrl.href);

    if (typeof data !== 'string') {
        throw new TypeError(`Steam returned an unexpected response for ${url}`);
    }

    return data;
};

const extractJsonObject = (source: string, startIndex: number): { jsonText: string; endIndex: number } => {
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = startIndex; index < source.length; index++) {
        const character = source[index];

        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (character === '\\') {
                escaped = true;
            } else if (character === '"') {
                inString = false;
            }
            continue;
        }

        if (character === '"') {
            inString = true;
        } else if (character === '{') {
            depth++;
        } else if (character === '}' && --depth === 0) {
            return {
                jsonText: source.slice(startIndex, index + 1),
                endIndex: index,
            };
        }
    }

    throw new Error('Steam discussion initialization data is incomplete');
};

const findInitialization = ($: CheerioAPI, callbackName: 'InitializeCommentThread' | 'InitializeForum' | 'InitializeForumTopic'): Initialization => {
    const callbackPattern = new RegExp(`\\b${callbackName}\\s*\\(`, 'g');

    for (const script of $('script:not([src])').toArray()) {
        const source = $(script).html() ?? '';
        for (const match of source.matchAll(callbackPattern)) {
            const objectStart = source.indexOf('{', match.index + match[0].length);
            if (objectStart === -1) {
                continue;
            }

            try {
                const { jsonText, endIndex } = extractJsonObject(source, objectStart);
                return {
                    data: JSON.parse(jsonText),
                    trailingSource: source.slice(endIndex + 1),
                };
            } catch {
                // Keep looking in case this occurrence is a function declaration or unrelated code.
            }
        }
    }

    throw new Error(`Steam discussion page is missing ${callbackName} initialization data`);
};

const validateForumMetadata = (value: unknown, identity: DiscussionIdentity): ForumMetadata => {
    const context = `app ${identity.appId}, feature ${identity.feature}`;
    if (!isRecord(value)) {
        throw new TypeError(`Steam returned invalid discussion metadata for ${context}`);
    }

    const { appid: metadataAppId, feature: metadataFeature, forum_display_name: forumName, forum_url: forumUrlValue, gidforum: forumId, is_public: isPublic, permissions: rawPermissions } = value;
    const { can_view: canView } = isRecord(rawPermissions) ? rawPermissions : {};
    const expectedPath = `/app/${identity.appId}/discussions/${identity.feature}/`;
    let forumUrl: URL;

    try {
        forumUrl = new URL(typeof forumUrlValue === 'string' ? forumUrlValue : '');
    } catch {
        throw new Error(`Steam returned an invalid forum URL for ${context}`);
    }

    if (
        String(metadataAppId) !== identity.appId ||
        metadataFeature !== identity.feature ||
        isPublic !== 1 ||
        canView !== 1 ||
        typeof forumId !== 'string' ||
        forumId === invalidForumId ||
        forumUrl.origin !== steamCommunityUrl ||
        forumUrl.pathname !== expectedPath
    ) {
        throw new Error(`Steam discussion forum for ${context} was not found or is not publicly accessible`);
    }

    if (typeof forumName !== 'string' || !forumName.trim()) {
        throw new Error(`Steam returned no discussion forum name for ${context}`);
    }

    return {
        forumName,
    };
};

const parseDiscussionThreadPagination = ($: CheerioAPI, identity: TopicIdentity): DiscussionThreadPagination => {
    const initializationData = findInitialization($, 'InitializeCommentThread').data;
    if (!isRecord(initializationData)) {
        throw new TypeError(`Steam returned invalid reply pagination for discussion topic ${identity.topicId}`);
    }

    const { feature2: initializedTopicId, total_count: replyCount, start, pagesize: pageSize, oldestfirst: oldestFirst } = initializationData;
    const isValidPagination =
        String(initializedTopicId) === identity.topicId &&
        typeof replyCount === 'number' &&
        Number.isSafeInteger(replyCount) &&
        replyCount >= 0 &&
        typeof start === 'number' &&
        Number.isSafeInteger(start) &&
        start >= 0 &&
        start <= replyCount &&
        typeof pageSize === 'number' &&
        Number.isSafeInteger(pageSize) &&
        pageSize > 0 &&
        start % pageSize === 0 &&
        oldestFirst === true;

    if (!isValidPagination) {
        throw new Error(`Steam returned invalid reply pagination for discussion topic ${identity.topicId}`);
    }

    return {
        replyCount,
        start,
        pageSize,
    };
};

const requiredText = ($: CheerioAPI, selector: string, label: string): string => {
    const value = $(selector).first().text();
    if (!value.trim()) {
        throw new Error(`Steam discussion page is missing ${label}`);
    }
    return value;
};

const toAbsoluteHttpUrl = (value: string | undefined, baseUrl: string): string | undefined => {
    if (!value) {
        return;
    }

    try {
        const url = new URL(value, baseUrl);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
    } catch {
        return;
    }
};

const parseAuthor = ($: CheerioAPI, authorElement: Cheerio<AnyNode>, baseUrl: string): DiscussionAuthor | undefined => {
    if (!authorElement.length) {
        return;
    }

    const authorClone = authorElement.clone();
    authorClone.find('.forum_author_action_pulldown').remove();
    const name = authorClone.text().trim();
    const url = toAbsoluteHttpUrl(authorElement.attr('href'), baseUrl);

    if (!name) {
        return;
    }

    return {
        name,
        ...(url && { url }),
    };
};

const parseTimestamp = (value: string | undefined, label: string): Date => {
    if (!value || !/^\d+$/.test(value)) {
        throw new Error(`Steam discussion page is missing ${label}`);
    }

    const date = parseDate(value, 'X');
    if (Number.isNaN(date.getTime())) {
        throw new TypeError(`Steam discussion page returned an invalid ${label}`);
    }
    return date;
};

const normalizeContentHtml = ($: CheerioAPI, content: Cheerio<AnyNode>, baseUrl: string): string => {
    for (const attribute of ['href', 'src', 'poster'] as const) {
        content.find(`[${attribute}]`).each((_index, element) => {
            const target = $(element);
            const absoluteUrl = toAbsoluteHttpUrl(target.attr(attribute), baseUrl);
            if (absoluteUrl) {
                target.attr(attribute, absoluteUrl);
            }
        });
    }

    return content.html()?.trim() ?? '';
};

const parsePreview = (tooltip: string | undefined): string | undefined => {
    if (!tooltip) {
        return;
    }

    const openingTag = '<div class="topic_hover_text">';
    const contentStart = tooltip.indexOf(openingTag);
    if (contentStart === -1) {
        return;
    }

    const previewStart = contentStart + openingTag.length;
    const contentEnd = tooltip.indexOf('</div>', previewStart);
    if (contentEnd === -1) {
        return;
    }

    const preview = tooltip.slice(previewStart, contentEnd).replaceAll('\r', '').trim();
    return preview ? escape(preview).replaceAll('\n', '<br>') : undefined;
};

export const parseDiscussionListPage = (html: string, identity: DiscussionIdentity): DiscussionListPage => {
    const $ = load(html);
    let metadata: ForumMetadata;
    try {
        metadata = validateForumMetadata(findInitialization($, 'InitializeForum').data, identity);
    } catch (error) {
        throw new Error(`Unable to read public Steam discussion forum for app ${identity.appId}, feature ${identity.feature}: ${getErrorMessage(error)}`, { cause: error });
    }
    const appName = requiredText($, '.apphub_AppName', 'app name');

    const topics = $('.forum_topic[data-gidforumtopic]')
        .slice(0, topicPageSize)
        .toArray()
        .map((element, sourceIndex): DiscussionListTopic => {
            const topic = $(element);
            const topicId = parseTopicId(topic.attr('data-gidforumtopic'));
            const title = topic.find('.forum_topic_name').first().text();
            const href = topic.find('a.forum_topic_overlay[href]').first().attr('href');
            const expectedLink = buildDiscussionTopicUrl({ ...identity, topicId });
            const actualLink = toAbsoluteHttpUrl(href, steamCommunityUrl);

            if (!title.trim() || !actualLink || new URL(actualLink).pathname !== new URL(expectedLink).pathname) {
                throw new Error(`Steam returned an invalid discussion topic row for topic ${topicId}`);
            }

            const authorName = topic.find('.forum_topic_op').first().text().trim();

            return {
                ...identity,
                topicId,
                title,
                link: expectedLink,
                preview: parsePreview(topic.attr('data-tooltip-forum')),
                ...(authorName && { authorName }),
                sourceIndex,
            };
        });

    return {
        appName,
        forumName: metadata.forumName,
        topics,
    };
};

const parseTopicDocument = (html: string, identity: TopicIdentity): DiscussionTopicPage & { $: CheerioAPI } => {
    const $ = load(html);
    let initialization: Initialization;
    let metadata: ForumMetadata;
    try {
        initialization = findInitialization($, 'InitializeForumTopic');
        metadata = validateForumMetadata(initialization.data, identity);
    } catch (error) {
        throw new Error(`Unable to read public Steam discussion topic ${identity.topicId} for app ${identity.appId}, feature ${identity.feature}: ${getErrorMessage(error)}`, { cause: error });
    }
    const initializedTopicId = /^\s*,\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\s*,\s*["'](\d+)["']/s.exec(initialization.trailingSource)?.[1];

    if (initializedTopicId !== identity.topicId) {
        throw new Error(`Steam discussion topic ${identity.topicId} was not found in app ${identity.appId}, feature ${identity.feature}`);
    }

    const topicUrl = buildDiscussionTopicUrl(identity);
    const appName = requiredText($, '.apphub_AppName', 'app name');
    const title = requiredText($, `#forum_op_topic_${identity.topicId}`, 'topic title');
    const originalPostElement = $(`#forum_op_${identity.topicId}`).first();
    const contentElement = $(`#forum_op_content_${identity.topicId}`).first();
    const author = parseAuthor($, originalPostElement.find('.forum_op_author[href]').first(), topicUrl);

    if (!originalPostElement.length || !contentElement.length || !author) {
        throw new Error(`Steam discussion topic ${identity.topicId} is missing its original post`);
    }

    const originalPost: DataItem = {
        title,
        link: topicUrl,
        guid: topicUrl,
        author: [author],
        pubDate: parseTimestamp(originalPostElement.find('.commentthread_comment_timestamp[data-timestamp]').first().attr('data-timestamp'), 'original post timestamp'),
        description: normalizeContentHtml($, contentElement, topicUrl),
    };

    return {
        $,
        appName,
        forumName: metadata.forumName,
        title,
        originalPost,
    };
};

export const parseDiscussionTopicPage = (html: string, identity: TopicIdentity): DiscussionTopicPage => {
    const topic = parseTopicDocument(html, identity);
    return {
        appName: topic.appName,
        forumName: topic.forumName,
        title: topic.title,
        originalPost: topic.originalPost,
    };
};

export const parseDiscussionThreadPage = (html: string, identity: TopicIdentity): DiscussionThreadPage => {
    const { $, ...topic } = parseTopicDocument(html, identity);
    const topicUrl = buildDiscussionTopicUrl(identity);
    const pagination = parseDiscussionThreadPagination($, identity);

    const replies = $('.commentthread_comment[id^="comment_"]')
        .slice(0, topicPageSize)
        .toArray()
        .map((element): DataItem => {
            const reply = $(element);
            const commentId = /^comment_(\d+)$/.exec(reply.attr('id') ?? '')?.[1];
            if (!commentId) {
                throw new Error(`Steam discussion topic ${identity.topicId} contains an invalid reply ID`);
            }

            const author = parseAuthor($, reply.find('.commentthread_author_link[href]').first(), topicUrl);
            const contentElement = reply.find('.commentthread_comment_text').first();
            if (!author || !contentElement.length) {
                throw new Error(`Steam discussion reply ${commentId} is missing its author or content`);
            }

            const link = new URL(`#c${commentId}`, topicUrl).href;
            return {
                title: `${topic.title} — ${author.name}`,
                link,
                guid: link,
                author: [author],
                pubDate: parseTimestamp(reply.find('.commentthread_comment_timestamp[data-timestamp]').first().attr('data-timestamp'), `reply ${commentId} timestamp`),
                description: normalizeContentHtml($, contentElement, topicUrl),
            };
        });

    return {
        ...topic,
        replies,
        pagination,
    };
};
