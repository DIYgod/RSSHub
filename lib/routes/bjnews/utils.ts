import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export function fetchArticle(item) {
    return cache.tryGet(item.link, async () => {
        const responses = await ofetch(item.link.replace('www.bjnews.com.cn', 'm.bjnews.com.cn'));
        const $d = load(responses);

        const timeText = $d('.time').text().trim();
        if (timeText) {
            item.pubDate = timezone(parseDate(timeText), +8);
        }

        const authorText = $d('.author').text().trim();
        if (authorText) {
            item.author = authorText;
        }

        const content = $d('.article-cen');
        item.description = content.length ? content.html() : $d('#contentStr').html();

        return item;
    });
}
