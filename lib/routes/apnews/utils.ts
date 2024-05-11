import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';

export function fetchArticle(item) {
    return cache.tryGet(item.link, async () => {
        const data = await ofetch(item.link);
        const $ = load(data);
        const ldjson = JSON.parse($('#link-ld-json').text())[0];
        $('div.Enhancement').remove();
        return {
            pubDate: timezone(parseDate(ldjson.datePublished), 0),
            updated: timezone(parseDate(ldjson.dateModified), 0),
            description: $('div.RichTextStoryBody').html(),
            category: [`section:${$("meta[property='article:section']").attr('content')}`, ...ldjson.keywords],
            guid: $("meta[name='brightspot.contentId']").attr('content'),
            author: ldjson.author,
            ...item,
        };
    });
}
