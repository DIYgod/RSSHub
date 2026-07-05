import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const FALLBACK_DESCRIPTION = '该通知无法直接预览，请点击原文链接↑查看';
const INTRANET_NOTICE = '您当前ip并非校内地址，该信息仅允许校内地址访问';

export interface NoticeItem extends DataItem {
    link: string;
}

// 站内日期写法不统一，可能为 2026-07-01、2026/07/01 或 2026年07月01日 14:53，且常带「发布时间：」等前缀
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

    if ($('.wp_error_msg').length > 0) {
        return { ...item, description: INTRANET_NOTICE };
    }

    const $content = $('.wp_articlecontent');
    if ($content.length === 0) {
        return { ...item, description: FALLBACK_DESCRIPTION };
    }

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

// 单篇文章抓取失败时回退到列表页信息，避免拖垮整个订阅源；站外链接不抓取正文
export function resolveArticles(list: NoticeItem[], pageUrl: string): Promise<DataItem[]> {
    const pageHost = new URL(pageUrl).host;
    return Promise.all(
        list.map(async (item) => {
            if (new URL(item.link).host !== pageHost) {
                return { ...item, description: FALLBACK_DESCRIPTION };
            }
            try {
                return (await cache.tryGet(item.link, () => fetchArticle(item))) as DataItem;
            } catch {
                return item;
            }
        })
    );
}
