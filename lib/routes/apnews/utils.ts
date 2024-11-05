import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import asyncPool from 'tiny-async-pool';

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
                title: ldjson.headline,
                pubDate: parseDate(ldjson.datePublished),
                updated: parseDate(ldjson.dateModified),
                description: $('div.RichTextStoryBody').html() || $(':is(.VideoLead, .VideoPage-pageSubHeading)').html(),
                category: [...(section ? [section] : []), ...(ldjson.keywords ?? [])],
                guid: $("meta[name='brightspot.contentId']").attr('content'),
                author: ldjson.author,
                ...item,
            };
        } else {
            // Live
            ldjson = rawLdjson;

            return {
                category: ldjson.keywords,
                pubDate: parseDate(ldjson.coverageStartTime),
                description: ldjson.description,
                guid: $("meta[name='brightspot.contentId']").attr('content'),
                ...item,
            };
        }
    });
}
export async function asyncPoolAll<IN, OUT>(poolLimit: number, array: readonly IN[], iteratorFn: (generator: IN) => Promise<OUT>) {
    const results: Awaited<OUT[]> = [];
    for await (const result of asyncPool(poolLimit, array, iteratorFn)) {
        results.push(result);
    }
    return results;
}
