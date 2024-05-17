import { load } from 'cheerio';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import g_encrypt from './execlib/x-zse-96-v3';
import md5 from '@/utils/md5';

export const header = {
    'x-api-version': '3.0.91',
};

export const processImage = (content) => {
    const $ = load(content, null, false);

    $('noscript').remove();

    $('a[data-draft-type="mcn-link-card"]').remove();

    $('a').each((_, elem) => {
        const href = $(elem).attr('href');
        if (href?.startsWith('https://link.zhihu.com/?target=')) {
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
                src: e.attribs['data-actualsrc'].replace('_b.jpg', '_1440w.jpg'),
                width: null,
                height: null,
            });
        } else if (e.attribs['data-original']) {
            $(e).attr({
                src: e.attribs['data-original'].replace('_r.jpg', '_1440w.jpg'),
                width: null,
                height: null,
            });
        } else {
            $(e).attr({
                src: e.attribs.src.replace('_b.jpg', '_1440w.jpg'),
                width: null,
                height: null,
            });
        }
    });

    return $.html();
};

export const getSignedHeader = async (url: string, apiPath: string) => {
    // Because the API of zhihu.com has changed, we must use the value of `d_c0` (extracted from cookies) to calculate
    // `x-zse-96`. So first get `d_c0`, then get the actual data of a ZhiHu question. In this way, we don't need to
    // require users to set the cookie in environmental variables anymore.

    // fisrt: get cookie(dc_0) from zhihu.com
    const dc0 = await cache.tryGet('zhihu:cookies:d_c0', async () => {
        const response = await ofetch.raw(url);

        const dc0 = response.headers
            .getSetCookie()
            .find((s) => s.startsWith('d_c0='))
            ?.split(';')[0];
        if (!dc0) {
            throw new Error('Failed to extract `d_c0` from cookies');
        }

        return dc0;
    });

    // calculate x-zse-96, refer to https://github.com/srx-2000/spider_collection/issues/18
    const xzse93 = '101_3_3.0';
    const f = `${xzse93}+${apiPath}+${dc0}`;
    const xzse96 = '2.0_' + g_encrypt(md5(f));
    return {
        cookie: `d_c0=${dc0}`,
        'x-zse-96': xzse96,
        'x-app-za': 'OS=Web',
        'x-zse-93': xzse93,
    };
};
