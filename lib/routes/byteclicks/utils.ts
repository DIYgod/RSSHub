import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import { PRESETS } from '@/utils/header-generator';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const baseUrl = 'https://byteclicks.com';

export const parseList = ($: CheerioAPI) =>
    $('article.post')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a.post-title');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: timezone(parseDate($item.find('.meta-item.primary em').text(), 'YYYY.MM.DD'), 8),
                category: $item.find('.cate-tag').text(),
            };
        });

export const parseItem = (item: DataItem) =>
    cache.tryGet(item.link!, async () => {
        const response = await ofetch(item.link!, { headerGeneratorOptions: PRESETS.MODERN_WINDOWS_CHROME });
        const $ = load(response);

        const content = $('.article-detail');
        content.find('.erphp-wppay, .copyright-message').remove();
        item.author = $('.meta-author em').text().trim();
        item.description = content.html()?.trim();

        return item;
    });
