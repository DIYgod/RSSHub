import { type CheerioAPI, load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const FALLBACK_DESCRIPTION = '该通知无法直接预览，请点击原文链接↑查看';

interface NoticeItem extends DataItem {
    link: string;
}

interface DetailSelectors {
    title: string;
    content: string;
    date?: string;
}

// Date formats vary across sites: 2026-03-30, 2026/05/06 or 2026年03月30日 14:37, often prefixed with a label such as "发布时间："
export function parsePubDate(text?: string): Date | undefined {
    const match = text?.match(/(\d{4})[-/.年]\s*(\d{1,2})[-/.月]\s*(\d{1,2})/);
    if (!match) {
        return undefined;
    }
    const [, year, month, day] = match;
    const time = text?.match(/(\d{1,2}:\d{2}(?::\d{2})?)/)?.[1];
    return timezone(parseDate(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}${time ? ` ${time}` : ''}`), 8);
}

export function parseNoticeList($: CheerioAPI, pageUrl: string, rowSelector: string, dateSelector: string): NoticeItem[] {
    return $(rowSelector)
        .toArray()
        .map((el) => {
            const $row = $(el);
            const $link = $row.find('a');
            const href = $link.attr('href');
            if (!href) {
                return null;
            }
            return {
                title: $link.attr('title') || $link.text().trim(),
                link: new URL(href, pageUrl).href,
                pubDate: parsePubDate($(dateSelector, $row).text()),
            };
        })
        .filter((item) => item !== null);
}

async function fetchArticle(item: NoticeItem, selectors: DetailSelectors): Promise<DataItem> {
    const response = await ofetch(item.link);
    const $ = load(response);

    // Pages whose body is an embedded PDF have no extractable content
    if ($('script:contains("showVsbpdfIframe")').length > 0) {
        return { ...item, description: FALLBACK_DESCRIPTION };
    }

    const $content = $(selectors.content);

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

    const title = $(selectors.title).text().trim();
    const pubDate = selectors.date ? parsePubDate($(selectors.date).text()) : undefined;

    return {
        ...item,
        title: title || item.title,
        pubDate: pubDate ?? item.pubDate,
        description: $content.html() ?? item.description,
    };
}

export function resolveArticles(list: NoticeItem[], selectors: DetailSelectors): Promise<DataItem[]> {
    return Promise.all(list.map((item) => cache.tryGet(item.link, () => fetchArticle(item, selectors)) as Promise<DataItem>));
}
