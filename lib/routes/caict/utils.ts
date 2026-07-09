import { type CheerioAPI, load } from 'cheerio';

import { config } from '@/config';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

/** Prefer HTTP: HTTPS is frequently blocked by the site WAF (412). */
export const rootUrl = 'http://www.caict.ac.cn';

const requestHeaders = () => ({
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    Referer: `${rootUrl}/`,
    'User-Agent': config.trueUA,
});

function isChallengePage(html: string): boolean {
    // WAF interstitial is tiny and lacks list markup
    if (html.length < 4000) {
        return true;
    }
    // Real list pages always include these markers
    return !html.includes('kxyj_text') && !html.includes('pagemain');
}

/**
 * Fetch a list page with retries. Site WAF intermittently returns 412 /
 * short challenge HTML, especially from datacenter IPs.
 */
export async function fetchPage(path: string, attempt = 0): Promise<{ $: CheerioAPI; url: string }> {
    const url = new URL(path.startsWith('/') ? path : `/${path}`, rootUrl).href;
    const headers = requestHeaders();
    const maxAttempts = 5;

    try {
        const data = await ofetch<string>(url, {
            headers,
            retry: 0,
            // Keep HTTP; do not force HTTPS
            responseType: 'text',
        });
        if (typeof data === 'string' && !isChallengePage(data)) {
            return { $: load(data), url };
        }
        if (attempt + 1 >= maxAttempts) {
            throw new Error(`WAF challenge or empty page for ${url}`);
        }
    } catch (error) {
        const status = (error as { statusCode?: number; status?: number }).statusCode ?? (error as { status?: number }).status;
        // 412 is the WAF response; retry a few times
        if (status && status !== 412 && status !== 403 && status < 500) {
            throw error;
        }
        if (attempt + 1 >= maxAttempts) {
            throw error;
        }
    }

    await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    return fetchPage(path, attempt + 1);
}

const skipTitle = new Set(['上一页', '下一页', '更多', '更多>>', '【更多】']);

function isWeixinHost(hostname: string): boolean {
    return hostname === 'mp.weixin.qq.com' || hostname.endsWith('.mp.weixin.qq.com');
}

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
        let hostname = '';
        try {
            const u = new URL(href, baseUrl);
            link = u.href;
            hostname = u.hostname;
        } catch {
            continue;
        }

        if (seen.has(link) || link.includes('zhaopin.caict') || link.includes('service.caict')) {
            continue;
        }

        const isContent = /\.(?:htm|html|pdf)(?:\?|$)/i.test(link) || isWeixinHost(hostname);
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
