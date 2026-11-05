import { load } from 'cheerio';

import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const baseUrl = 'http://www.qstheory.cn';

export const getItem = async (item: DataItem, useArticleTitle = false): Promise<DataItem> => {
    const response = await ofetch(item.link!);
    const $ = load(response);

    const author = $('.appellation')
        .toArray()
        .map((el) =>
            $(el)
                .text()
                .match(/作者[：:]\s*(.+)/)?.[1]
                .replaceAll(/\s+/g, ' ')
                .trim()
        )
        .find(Boolean);
    if (author) {
        item.author = author;
    }

    if (useArticleTitle) {
        // Article header: the title and the optional subtitle right after it
        const $title = $('.inner > h1').first();
        const title = [$title.text(), $title.next('h2').text()].filter((text) => /\S/.test(text)).join(' ');
        if (title) {
            item.title = title;
        }
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
