import { load } from 'cheerio';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const baseUrl = 'http://www.qstheory.cn';

export const getItem = async (item) => {
    const response = await ofetch(item.link);
    const $ = load(response);

    $('.fs-text, .fs-pinglun, .hidden-xs').remove();

    // Derive the title from the page when the caller did not supply one,
    // so single-article routes don't have to pre-fetch just to read the title.
    item.title ??= $('h1').first().text().trim() || $('head title').text().trim();
    item.author = $('.appellation').text();
    item.description = $('.highlight, .text').html() || $('.content').html();
    item.pubDate = parseDate(
        $('.puttime_mobi, .pubtime, .headtitle span')
            .text()
            .trim()
            .replace('发表于', '')
            .replaceAll(/(年|月)/g, '-')
            .replace('日', '')
    );

    return item;
};
