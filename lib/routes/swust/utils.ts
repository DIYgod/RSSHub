import { load } from 'cheerio';

import ofetch from '@/utils/ofetch';

const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1';

// The site serves a meta-refresh interstitial instead of an HTTP redirect
export async function request(url: string, referer?: string): Promise<string> {
    const headers: Record<string, string> = { 'User-Agent': userAgent };
    if (referer) {
        headers.Referer = referer;
    }

    const body = await ofetch(url, { responseType: 'text', headers });

    const content = load(body)('meta[http-equiv="refresh"]').attr('content');
    if (!content) {
        return body;
    }

    let redirect = content.split(';', 2)[1].trim();
    if (redirect.startsWith('url=')) {
        redirect = redirect.slice(4);
    }

    return request(redirect, url);
}

// The JSON endpoints answer with a bare JavaScript object literal, not valid JSON
export function evil(fn: string) {
    const Fn = Function;
    return new Fn(`return ${fn}`)();
}
