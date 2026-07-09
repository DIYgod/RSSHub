import { type CheerioAPI, load } from 'cheerio';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

/** Prefer HTTP: HTTPS is frequently blocked by the site WAF (412). */
export const rootUrl = 'http://www.caict.ac.cn';

const requestHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    Referer: `${rootUrl}/`,
};

export async function fetchPage(path: string) {
    const url = new URL(path.startsWith('/') ? path : `/${path}`, rootUrl).href;
    const data = await ofetch(url, { headers: requestHeaders });
    return { $: load(data), url };
}

const skipTitle = new Set(['上一页', '下一页', '更多', '更多>>', '【更多】']);

export function parseList($: CheerioAPI, baseUrl: string, limit = 20) {
    const items: Array<{ title: string; link: string; pubDate?: Date }> = [];
    const seen = new Set<string>();

    for (const el of $('a.kxyj_text').toArray()) {
        const a = $(el);
        const href = a.attr('href');
        if (!href || href.startsWith('javascript') || href.includes('_sPageName') || href.includes('_nCurrIndex')) {
            continue;
        }

        const title = (a.attr('title') || a.text() || '')
            .replaceAll(/\s+/g, ' ')
            .replace(/^[\s\-–—]+/, '')
            .trim();
        if (!title || skipTitle.has(title) || title.includes('更多')) {
            continue;
        }

        let link: string;
        try {
            link = new URL(href, baseUrl).href;
        } catch {
            continue;
        }

        if (seen.has(link) || link.includes('zhaopin.caict') || link.includes('service.caict')) {
            continue;
        }

        // Keep article / PDF / weixin links; skip bare section roots
        let isWeixin = false;
        try {
            const host = new URL(link).hostname;
            isWeixin = host === 'mp.weixin.qq.com' || host.endsWith('.mp.weixin.qq.com');
        } catch {
            continue;
        }
        const isContent = /\.(?:htm|html|pdf)(?:\?|$)/i.test(link) || isWeixin;
        if (!isContent) {
            continue;
        }

        const tr = a.closest('tr');
        let dateText = '';
        if (tr.length) {
            for (const span of tr.find('span.kxyj_text').toArray()) {
                const text = $(span).text().trim();
                if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
                    dateText = text;
                    break;
                }
            }
        }

        seen.add(link);
        items.push({
            title,
            link,
            pubDate: dateText ? timezone(parseDate(dateText), 8) : undefined,
        });

        if (items.length >= limit) {
            break;
        }
    }

    return items;
}
