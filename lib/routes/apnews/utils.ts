import { load } from 'cheerio';

import type { DataItem, Language } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export function removeDuplicateByKey(items, key: string) {
    return new Map(items.map((x) => [x[key], x])).values().toArray();
}

export async function fetchPage(url: string): Promise<string> {
    let response = await ofetch.raw<string, 'text'>(url, { responseType: 'text', ignoreResponseError: true });
    const cookies = response.headers
        .getSetCookie()
        .map((cookie) => cookie.split(';', 1)[0])
        .join('; ');
    if (response.status === 403 && cookies) {
        response = await ofetch.raw<string, 'text'>(url, { responseType: 'text', headers: { Cookie: cookies }, ignoreResponseError: true });
    }
    if (!response.ok || !response._data) {
        throw new Error(`AP News returned ${response.status} for ${url}. Check that the official source is public and available.`);
    }
    return response._data;
}

export async function fetchScreen(path: string) {
    const response = await ofetch('https://apnews.com/graphql/delivery/ap/v1', {
        query: {
            operationName: 'ContentPageQuery',
            variables: { path },
            extensions: { persistedQuery: { version: 1, sha256Hash: '3bc305abbf62e9e632403a74cc86dc1cba51156d2313f09b3779efec51fc3acb' } },
        },
    });
    if (!response.data?.Screen) {
        throw new Error(`AP News did not return public page metadata for ${path}`);
    }
    return response.data.Screen;
}

export function fetchMetadata(link: string) {
    return cache.tryGet(`${link}:metadata`, async (): Promise<Partial<DataItem>> => {
        const path = new URL(link).pathname;
        if (path.startsWith('/video/')) {
            const response = await fetchPage(link);
            const $ = load(response);
            const json = $('#link-ld-json').text();
            const linkedData = json ? JSON.parse(json) : {};
            const article = Array.isArray(linkedData) ? (linkedData.find((entry) => entry['@type'] === 'NewsArticle') ?? {}) : linkedData;
            const title = article.headline ?? article.name ?? $('meta[property="og:title"]').attr('content');
            if (!title) {
                throw new Error(`AP News did not return a video title for ${link}`);
            }
            return {
                title,
                description: article.description ?? $('meta[property="og:description"]').attr('content'),
                pubDate: article.datePublished ? parseDate(article.datePublished) : undefined,
                category: article.articleSection,
                language: $('html').attr('lang') as Language,
            };
        }
        const screen = await fetchScreen(path);
        if (!screen.title) {
            throw new Error(`AP News did not return an article title for ${link}`);
        }
        return {
            title: screen.title,
            description: screen.description,
            category: screen.category,
            language: screen.language as Language,
        };
    });
}

export function fetchArticle(item) {
    return cache.tryGet(item.link, async () => {
        const data = await fetchPage(item.link);
        const $ = load(data);
        if ($('#link-ld-json').length === 0) {
            const gtmRaw = $('meta[name="gtm-dataLayer"]').attr('content');
            if (gtmRaw) {
                const gtmParsed = JSON.parse(gtmRaw);
                return {
                    title: gtmParsed.headline,
                    pubDate: parseDate(gtmParsed.publication_date),
                    description: $('div.RichTextStoryBody').html() || $(':is(.VideoLead, .VideoPage-pageSubHeading)').html(),
                    category: gtmParsed.tag_array.split(','),
                    guid: $("meta[name='brightspot.contentId']").attr('content'),
                    author: gtmParsed.author,
                    ...item,
                };
            }
            return item;
        }
        const rawLdjson = JSON.parse($('#link-ld-json').text());
        let ldjson;
        if (rawLdjson['@type'] === 'NewsArticle' || (Array.isArray(rawLdjson) && rawLdjson.some((e) => e['@type'] === 'NewsArticle'))) {
            // Regular(Articles, Videos)
            ldjson = Array.isArray(rawLdjson) ? rawLdjson.find((e) => e['@type'] === 'NewsArticle') : rawLdjson;

            $('div.Enhancement').remove();
            const section = $("meta[property='article:section']").attr('content');
            return {
                ...item,
                title: ldjson.headline,
                pubDate: parseDate(ldjson.datePublished),
                updated: parseDate(ldjson.dateModified),
                description: $('div.RichTextStoryBody').html() || $(':is(.VideoLead, .VideoPage-pageSubHeading)').html(),
                category: [...(section ? [section] : []), ...(ldjson.keywords ?? [])],
                guid: $("meta[name='brightspot.contentId']").attr('content'),
                author: ldjson.author,
            };
        }
        // Live
        ldjson = rawLdjson;

        const url = new URL(item.link);
        const description = url.hash ? $(url.hash).parent().find('.LiveBlogPost-body').html() : ldjson.description;
        const pubDate = url.hash ? parseDate(Number($(url.hash).parent().attr('data-posted-date-timestamp'))) : parseDate(ldjson.coverageStartTime);

        return {
            ...item,
            category: ldjson.keywords,
            pubDate,
            description,
            guid: $("meta[name='brightspot.contentId']").attr('content'),
        };
    });
}
