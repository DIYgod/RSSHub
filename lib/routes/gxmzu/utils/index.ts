import { type CheerioAPI, load } from 'cheerio';
import { html } from 'hono/html';
import pMap from 'p-map';

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
    const dateText = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const calendarDate = new Date(`${dateText}T00:00:00Z`);
    if (Number.isNaN(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== dateText) {
        return undefined;
    }
    const time = text?.match(/(\d{1,2}:\d{2}(?::\d{2})?)/)?.[1];
    if (time) {
        const [hours, minutes, seconds = 0] = time.split(':').map(Number);
        if (hours > 23 || minutes > 59 || seconds > 59) {
            return undefined;
        }
    }
    const date = timezone(parseDate(`${dateText}${time ? ` ${time}` : ''}`), 8);
    return Number.isNaN(date.getTime()) ? undefined : date;
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
                title: $link.attr('title') || $link.text(),
                link: new URL(href, pageUrl).href,
                pubDate: parsePubDate($(dateSelector, $row).text()),
            };
        })
        .filter((item) => item !== null);
}

async function fetchArticle(item: NoticeItem, selectors: DetailSelectors): Promise<DataItem> {
    const response = await ofetch(item.link);
    const $ = load(response);

    const $content = $(selectors.content);
    $content.find('script').each((_, element) => {
        const file = $(element)
            .text()
            .match(/showVsbpdfIframe\(\s*(['"])(.*?)\1/)?.[2];
        if (!file) {
            return;
        }
        const fileUrl = new URL(file, item.link);
        const preview = /\.(?:png|jpe?g|gif|webp)$/i.test(fileUrl.pathname) ? html`<img src="${fileUrl.href}" />` : html`<iframe src="${fileUrl.href}"></iframe>`;
        const fileLink = html`<p><a href="${fileUrl.href}">原文件</a></p>`;
        const filePreview = html`${preview}${'\n                    '}${fileLink}`;
        $(element).replaceWith(filePreview.toString());
    });

    const title = $(selectors.title).text();
    const pubDate = selectors.date ? parsePubDate($(selectors.date).text()) : undefined;

    return {
        ...item,
        title: /\S/.test(title) ? title : item.title,
        pubDate: pubDate ?? item.pubDate,
        description: $content.html(),
    };
}

// Content of off-site links (e.g. WeChat posts or sibling-subdomain sites) is not fetched
export function resolveArticles(list: NoticeItem[], pageUrl: string, selectors: DetailSelectors): Promise<DataItem[]> {
    const pageHost = new URL(pageUrl).host;
    return pMap(
        list,
        (item) => {
            if (new URL(item.link).host !== pageHost) {
                return { ...item, description: FALLBACK_DESCRIPTION };
            }
            return cache.tryGet(item.link, () => fetchArticle(item, selectors));
        },
        { concurrency: 3 }
    );
}
