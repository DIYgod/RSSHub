import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export function removeDuplicateByKey(items, key: string) {
    return [...new Map(items.map((x) => [x[key], x])).values()];
}

export function fetchArticle(item) {
    return cache.tryGet(item.link, async () => {
        const data = await ofetch(item.link);
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
            } else {
                return item;
            }
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
                author: ldjson.author?.map((e) => e.mainEntity),
            };
        } else {
            // Live
            ldjson = rawLdjson;

            const url = new URL(item.link);
            const description = url.hash ? $(url.hash).parent().find('.LiveBlogPost-body').html() : ldjson.description;
            const pubDate = url.hash ? parseDate(Number.parseInt($(url.hash).parent().attr('data-posted-date-timestamp'), 10)) : parseDate(ldjson.coverageStartTime);

            return {
                ...item,
                category: ldjson.keywords,
                pubDate,
                description,
                guid: $("meta[name='brightspot.contentId']").attr('content'),
            };
        }
    });
}
