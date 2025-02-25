import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const baseUrl = 'http://www.qstheory.cn';

export const getItem = async (item) => {
    const response = await ofetch(item.link);
    const $ = cheerio.load(response);

    $('.fs-text, .fs-pinglun, .hidden-xs').remove();

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
