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

// Date formats vary across sites: 2026-05-28, 2026/06/02 or 2026年05月28日 14:53, often prefixed with a label such as "发布日期："
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

// Content of off-site links (e.g. WeChat posts or sibling-subdomain sites) is not fetched
export function resolveArticles(list: NoticeItem[], pageUrl: string, selectors: DetailSelectors): Promise<DataItem[]> {
    const pageHost = new URL(pageUrl).host;
    return Promise.all(
        list.map((item) => {
            if (new URL(item.link).host !== pageHost) {
                return { ...item, description: FALLBACK_DESCRIPTION };
            }
            return cache.tryGet(item.link, () => fetchArticle(item, selectors)) as Promise<DataItem>;
        })
    );
}
