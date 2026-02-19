import { load } from 'cheerio';

import { config } from '@/config';
import cache from '@/utils/cache';
import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';

import g_encrypt from './execlib/x-zse-96-v3';

export const header = {
    'x-api-version': '3.0.91',
};

const fixImageUrl = (url: string) => url.split('?')[0].replace('_b.jpg', '.jpg').replace('_r.jpg', '.jpg').replace('_720w.jpg', '.jpg');

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

export const getCookieValueByKey = (key: string) =>
    config.zhihu.cookies
        ?.split(';')
        .map((e) => e.trim())
        .find((e) => e.startsWith(key + '='))
        ?.slice(key.length + 1) || '';

export const getSignedHeader = async (url: string, apiPath: string) => {
    if (config?.zhihu?.cookies) {
        const dc0 = getCookieValueByKey('d_c0');

        const xzse93 = '101_3_3.0';
        const f = `${xzse93}+${apiPath}+${dc0}`;
        const xzse96 = '2.0_' + g_encrypt(md5(f));
        return {
            cookie: config.zhihu.cookies,
            'x-zse-96': xzse96,
            'x-app-za': 'OS=Web',
            'x-zse-93': xzse93,
        };
    } else {
        // NOTICE: this method is out of date.
        // Because the API of zhihu.com has changed, we must use the value of `d_c0` (extracted from cookies) to calculate
        // `x-zse-96`. So first get `d_c0`, then get the actual data of a ZhiHu question. In this way, we don't need to
        // require users to set the cookie in environmental variables anymore.

        // fisrt: get cookie(dc_0) from zhihu.com
        const { dc0, zseCk } = await cache.tryGet('zhihu:cookies:d_c0', async () => {
            if (getCookieValueByKey('d_c0') && getCookieValueByKey('__zse_ck')) {
                return { dc0: getCookieValueByKey('d_c0'), zseCk: getCookieValueByKey('__zse_ck') };
            }
            const response1 = await ofetch.raw('https://static.zhihu.com/zse-ck/v3.js');
            const script = await response1._data.text();
            const zseCk = script.match(/__g\.ck\|\|"([\w+/=\\]*?)",_=/)?.[1];
            const response2 = zseCk
                ? await ofetch.raw(url, {
                      headers: {
                          cookie: `${response1.headers
                              .getSetCookie()
                              .map((s) => s.split(';')[0])
                              .join('; ')}; __zse_ck=${zseCk}`,
                      },
                  })
                : null;

            const dc0 =
                (response2 || response1).headers
                    .getSetCookie()
                    .find((s) => s.startsWith('d_c0='))
                    ?.split(';')[0]
                    .trim()
                    .slice('d_c0='.length) || '';

            return { dc0, zseCk };
        });

        // calculate x-zse-96, refer to https://github.com/srx-2000/spider_collection/issues/18
        const xzse93 = '101_3_3.0';
        const f = `${xzse93}+${apiPath}+${dc0}`;
        const xzse96 = '2.0_' + g_encrypt(md5(f));

        const zc0 = getCookieValueByKey('z_c0');

        return {
            cookie: `__zse_ck=${zseCk}; d_c0=${dc0}${zc0 ? `;z_c0=${zc0}` : ''}`,
            'x-zse-96': xzse96,
            'x-app-za': 'OS=Web',
            'x-zse-93': xzse93,
        };
    }
};
