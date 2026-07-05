import { type CheerioAPI, load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const FALLBACK_DESCRIPTION = '该通知无法直接预览，请点击原文链接↑查看';

export interface NoticeItem extends DataItem {
    link: string;
}

export interface DetailSelectors {
    title: string;
    content: string;
    date?: string;
}

// 各站日期写法不统一，可能为 2026-03-30、2026/05/06 或 2026年03月30日 14:37，且常带「发布时间：」等前缀
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
            const $link = $row.find('a').first();
            const href = $link.attr('href');
            if (!href) {
                return null;
            }
            return {
                title: $link.attr('title') || $link.text().trim(),
                link: new URL(href, pageUrl).href,
                pubDate: parsePubDate($row.find(dateSelector).text()),
            };
        })
        .filter((item) => item !== null);
}

async function fetchArticle(item: NoticeItem, selectors: DetailSelectors): Promise<DataItem> {
    const response = await ofetch(item.link);
    const $ = load(response);

    // 正文为嵌入式 PDF 的页面没有可提取的内容
    if ($('script:contains("showVsbpdfIframe")').length > 0) {
        return { ...item, description: FALLBACK_DESCRIPTION };
    }

    const $content = $(selectors.content).first();
    if ($content.length === 0) {
        return { ...item, description: FALLBACK_DESCRIPTION };
    }

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

    const title = $(selectors.title).first().text().trim();
    const pubDate = selectors.date ? parsePubDate($(selectors.date).text()) : undefined;

    return {
        ...item,
        title: title || item.title,
        pubDate: pubDate ?? item.pubDate,
        description: $content.html() ?? item.description,
    };
}

// 单篇文章抓取失败时回退到列表页信息，避免拖垮整个订阅源；站外链接不抓取正文
export function resolveArticles(list: NoticeItem[], pageUrl: string, selectors: DetailSelectors): Promise<DataItem[]> {
    const pageHost = new URL(pageUrl).host;
    return Promise.all(
        list.map(async (item) => {
            if (new URL(item.link).host !== pageHost) {
                return { ...item, description: FALLBACK_DESCRIPTION };
            }
            try {
                return (await cache.tryGet(item.link, () => fetchArticle(item, selectors))) as DataItem;
            } catch {
                return item;
            }
        })
    );
}
