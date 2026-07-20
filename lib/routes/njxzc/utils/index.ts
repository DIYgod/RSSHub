import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

interface NoticeItem extends DataItem {
    link: string;
}

// Date formats vary across the site: 2026-07-01, 2026/07/01 or 2026年07月01日 14:53, often prefixed with a label such as "发布时间："
export function parsePubDate(text?: string): Date | undefined {
    const match = text?.match(/(\d{4})[-/.年]\s*(\d{1,2})[-/.月]\s*(\d{1,2})/);
    if (!match) {
        return undefined;
    }
    const [, year, month, day] = match;
    const time = text?.match(/(\d{1,2}:\d{2}(?::\d{2})?)/)?.[1];
    return timezone(parseDate(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}${time ? ` ${time}` : ''}`), 8);
}

async function fetchArticle(item: NoticeItem): Promise<DataItem> {
    const response = await ofetch(item.link);
    const $ = load(response);

    const $content = $('.wp_articlecontent');

    $content.find('.wp_pdf_player').each((_, el) => {
        const $player = $(el);
        const pdfSrc = $player.attr('pdfsrc');
        if (pdfSrc) {
            $player.replaceWith(`<p><a href="${new URL(pdfSrc, item.link).href}">附件下载</a></p>`);
        } else {
            $player.remove();
        }
    });
    $content.find('a').each((_, el) => {
        const $a = $(el);
        const href = $a.attr('href');
        if (href) {
            $a.attr('href', new URL(href, item.link).href);
        }
    });
    $content.find('img').each((_, el) => {
        const $img = $(el);
        const src = $img.attr('src');
        if (src) {
            $img.attr('src', new URL(src, item.link).href);
        }
    });

    const title = $('.arti_title').text().trim();
    const pubDate = parsePubDate($('.arti_update').text());

    return {
        ...item,
        title: title || item.title,
        pubDate: pubDate ?? item.pubDate,
        description: $content.html() ?? item.description,
    };
}

export function resolveArticles(list: NoticeItem[]): Promise<DataItem[]> {
    return Promise.all(list.map((item) => cache.tryGet(item.link, () => fetchArticle(item)) as Promise<DataItem>));
}
