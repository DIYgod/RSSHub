import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';

export function fetchArticle(item) {
    return cache.tryGet(item.link, async () => {
        const data = await ofetch(item.link);
        const $ = load(data);
        $('div.Enhancement').remove();
        return Object.assign(item, {
            pubDate: timezone(parseDate($("meta[property='article:published_time']").attr('content')), 0),
            updated: timezone(parseDate($("meta[property='article:modified_time']").attr('content')), 0),
            description: $('div.RichTextStoryBody').html(),
            category: $("meta[property='article:section']").attr('content'),
            guid: $("meta[name='brightspot.contentId']").attr('content'),
        });
    });
}
