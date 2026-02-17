import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export function fetchArticle(item) {
    return cache.tryGet(item.link, async () => {
        const responses = await ofetch(item.link);
        const $d = load(responses);
        // $d('img').each((i, e) => $(e).attr('referrerpolicy', 'no-referrer'));

        item.pubDate = timezone(parseDate($d('.left-info .timer').text()), +8);
        item.author = $d('.left-info .reporter').text();
        item.description = $d('#contentStr').html();

        return item;
    });
}
