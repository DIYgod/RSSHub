import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const parseArticle = async (item: DataItem): Promise<DataItem> => {
    const details = await cache.tryGet(item.link!, async () => {
        const { data: response } = await got(item.link!);
        const $ = load(response);
        const infoBox = $('div.info-box');
        return {
            author: infoBox.find('b:nth-child(4)').text().trim(),
            pubDate: timezone(parseDate(infoBox.find('i:last-child').text()), 8),
            description: $('.article-main-contentraw').html(),
        };
    });
    return { ...item, author: details.author, pubDate: details.pubDate, description: details.description };
};

export { parseArticle };
