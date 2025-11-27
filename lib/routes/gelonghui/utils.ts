import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const parseItem = (item, tryGet) =>
    tryGet(item.link, async () => {
        const { data: res } = await got(item.link);
        const $ = load(res);
        if (item.link.startsWith('https://www.gelonghui.com/live/')) {
            item.title = $('.type-name').next().text().trim();
            item.description = $('.dtb-content').html();
        } else {
            // article
            item.title = $('.article-title').text().trim();
            item.description = $('.article-summary').html() + $('article.article-with-html').html();
            if (!item.pubDate) {
                const isRelativeDate = $('time.date').text().includes('前') || $('time.date').text().includes('天');
                item.pubDate = isRelativeDate ? parseRelativeDate($('time.date').text()) : timezone(parseDate($('time.date').text(), 'MM-DD HH:mm'), +8);
            }
        }
        return item;
    });

export { parseItem };
