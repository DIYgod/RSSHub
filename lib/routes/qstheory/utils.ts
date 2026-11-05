import { load } from 'cheerio';

import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const baseUrl = 'http://www.qstheory.cn';

export const getItem = async (item: DataItem): Promise<DataItem> => {
    const response = await ofetch(item.link!);
    const $ = load(response);

    const appellation = $('.appellation').text();
    const authorMatch = appellation.match(/作者[：:]\s*(.+)/);
    const sourceMatch = appellation.match(/来源[：:]\s*(.+)/);
    let author: string | undefined;

    if (authorMatch) {
        author = authorMatch[1];
    } else if (sourceMatch && !sourceMatch[1].includes('《求是》') && !sourceMatch[1].includes('《红旗文稿》')) {
        author = sourceMatch[1];
    }

    if (author) {
        const cleanedAuthor = author.replaceAll('\u{00A0}', ' ').replaceAll(/\s+/g, ' ').trim();
        if (cleanedAuthor) {
            item.author = cleanedAuthor;
        }
    }

    const h1 = $('h1').text();
    const h2 = $('h2').text();
    const hasH1 = /\S/.test(h1);
    const hasH2 = /\S/.test(h2);
    const title = hasH1 ? (hasH2 ? `${h1} ${h2}` : h1) : item.title;
    if (title) {
        item.title = title;
    }

    $('.fs-text, .fs-pinglun, .hidden-xs').remove();
    item.description = $('.highlight, .text').html() || $('.content').html() || undefined;

    const dateStr =
        $('.puttime_mobi, .pubtime, .headtitle span')
            .text()
            .trim()
            .replace('发表于', '')
            .replaceAll(/(年|月)/g, '-')
            .replace('日', '') || $('meta[name="publishdate"]').attr('content');

    if (dateStr) {
        const parsedDate = parseDateInTimezone(dateStr, 8);
        if (!Number.isNaN(parsedDate.getTime())) {
            item.pubDate = parsedDate;
        }
    }

    return item;
};
