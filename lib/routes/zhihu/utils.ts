import { load } from 'cheerio';

import { config } from '@/config';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import md5 from '@/utils/md5';
import playwright from '@/utils/playwright';

import { encrypt as g_encrypt } from './execlib/x-zse-96-v3';

export const header = {
    'x-api-version': '3.0.91',
};

const fixImageUrl = (url: string) => url.split('?', 1)[0].replace('_b.jpg', '.jpg').replace('_r.jpg', '.jpg').replace('_720w.jpg', '.jpg');

export const processImage = (content: string) => {
    const $ = load(content, null, false);

    $('noscript, a[data-draft-type="mcn-link-card"]').remove();

    $('a').each((_, elem) => {
        const href = $(elem).attr('href');
        if (href?.startsWith('http://link.zhihu.com/?target=') || href?.startsWith('https://link.zhihu.com/?target=')) {
            const url = new URL(href);
            const target = url.searchParams.get('target') || '';
            try {
                $(elem).attr('href', decodeURIComponent(target));
            } catch {
                // sometimes the target is not a valid url
            }
        }
    });

    $('img.content_image, img.origin_image, img.content-image, img.data-actualsrc, figure>img').each((i, e) => {
        if (e.attribs['data-actualsrc']) {
            $(e).attr({
                src: fixImageUrl(e.attribs['data-actualsrc']),
                width: null,
                height: null,
            });
            $(e).removeAttr('data-actualsrc');
        } else if (e.attribs['data-original']) {
            $(e).attr({
                src: fixImageUrl(e.attribs['data-original']),
                width: null,
                height: null,
            });
            $(e).removeAttr('data-original');
        } else {
            $(e).attr({
                src: fixImageUrl(e.attribs.src),
                width: null,
                height: null,
            });
        }
    });

    return $.html();
};

const getCookieValueFrom = (cookieStr: string | undefined, key: string) =>
    cookieStr
        ?.split(';')
        .map((e) => e.trim())
        .find((e) => e.startsWith(key + '='))
        ?.slice(key.length + 1) || '';

export const getCookieValueByKey = (key: string) => getCookieValueFrom(config.zhihu.cookies as string | undefined, key);

// Zhihu's web API needs a self-consistent triple: the `d_c0` cookie, the
// `__zse_ck` cookie, and the `x-zse-96`/`x-zse-93` request signature (derived
// from `d_c0`). `__zse_ck` is computed at runtime by Zhihu's obfuscated JS from
// the device fingerprint plus `d_c0`, it rotates every few days, and the backend
// cross-checks it against `d_c0`, so it has to be produced by a real browser.
//
// On top of that, most content (column item lists, answers, user activities,
// ...) now also requires the `z_c0` login cookie, which can only be obtained by
// logging in. Provide it in ZHIHU_COOKIES (copied from a logged-in browser);
// without it those endpoints return 403.
//
// So we run Zhihu's JS in a real browser seeded with the configured cookies, let
// it compute a fresh `__zse_ck` for the (logged-in) session, and harvest the
// whole cookie jar. The rotating `__zse_ck` is refreshed on a timer, so the only
// thing the user maintains is the long-lived `d_c0`/`z_c0`.
//
// Recommended ZHIHU_COOKIES: `d_c0=...; z_c0=...` (omit `__zse_ck` so it is
// refreshed automatically; a pinned `__zse_ck` is trusted as-is and will expire).
const ZSE_CK_CACHE_KEY = 'zhihu:browser-cookies';
// `__zse_ck` rotates every few days; re-harvest at most this often so we are not
// launching a browser on every request.
const ZSE_CK_TTL = 30 * 60;

const harvestBrowserCookies = (seedCookies?: string): Promise<string> =>
    cache.tryGet(
        ZSE_CK_CACHE_KEY,
        async () => {
            const context = await playwright();
            try {
                const page = await context.newPage();

                if (seedCookies) {
                    const seeded = seedCookies
                        .split(';')
                        .map((pair) => pair.trim())
                        .filter(Boolean)
                        .map((pair) => {
                            // Split on the first '=' only: values such as the
                            // base64-ish `z_c0` contain further '=' characters.
                            const idx = pair.indexOf('=');
                            return idx === -1 ? { name: '', value: pair, domain: '.zhihu.com', path: '/' } : { name: pair.slice(0, idx), value: pair.slice(idx + 1), domain: '.zhihu.com', path: '/' };
                        })
                        .filter((c) => c.name);
                    if (seeded.length) {
                        await context.addCookies(seeded);
                    }
                }

                await page.goto('https://www.zhihu.com/', { waitUntil: 'domcontentloaded' });

                // Wait until Zhihu's JS has computed and set `__zse_ck` (it is
                // written to `document.cookie` alongside `d_c0`).
                try {
                    await page.waitForFunction(() => /(?:^|;\s*)__zse_ck=/.test(document.cookie) && /(?:^|;\s*)d_c0=/.test(document.cookie), null, { polling: 300, timeout: 10000 });
                } catch {
                    // token did not appear in time; harvest whatever cookies exist
                }

                const cookies = await context.cookies();
                return cookies
                    .filter(({ domain }) => domain === 'zhihu.com' || domain.endsWith('.zhihu.com'))
                    .map(({ name, value }) => (name ? `${name}=${value}` : value))
                    .join('; ');
            } finally {
                await context.close();
            }
        },
        ZSE_CK_TTL,
        false
    );

export const getSignedHeader = async (url: string, apiPath: string) => {
    const configured = (config?.zhihu?.cookies as string | undefined) || '';

    // If a complete, self-consistent pair (`d_c0` + `__zse_ck`) is configured,
    // trust it as-is. Otherwise harvest a fresh, consistent pair from a real
    // browser, seeding any configured cookies (notably the `z_c0` login cookie).
    let cookieStr: string;
    if (getCookieValueFrom(configured, 'd_c0') && getCookieValueFrom(configured, '__zse_ck')) {
        cookieStr = configured;
    } else {
        cookieStr = await harvestBrowserCookies(configured);
        if (!getCookieValueFrom(cookieStr, '__zse_ck') || !getCookieValueFrom(cookieStr, 'd_c0')) {
            logger.warn('zhihu: failed to harvest a valid __zse_ck/d_c0 pair from the browser; requests may be rejected with 403.');
        }
        if (!getCookieValueFrom(cookieStr, 'z_c0')) {
            logger.warn('zhihu: no z_c0 login cookie configured; most content (column items, answers, activities) requires login and will return 403. Set ZHIHU_COOKIES=d_c0=...; z_c0=... copied from a logged-in browser.');
        }
    }

    // Sign with the same `d_c0` that is sent, otherwise the backend rejects the
    // request. Refer to https://github.com/srx-2000/spider_collection/issues/18
    const dc0 = getCookieValueFrom(cookieStr, 'd_c0');
    const xzse93 = '101_3_3.0';
    const f = `${xzse93}+${apiPath}+${dc0}`;
    const xzse96 = '2.0_' + g_encrypt(md5(f));

    return {
        cookie: cookieStr,
        'x-zse-96': xzse96,
        'x-app-za': 'OS=Web',
        'x-zse-93': xzse93,
    };
};
