import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/foia-annual-report',
    categories: ['government'],
    example: '/cia/foia-annual-report',
    name: 'Annual FOIA Reports',
    maintainers: ['nczitzk'],
    handler,
};

const fetchPage = async (target: string) => {
    const jar: Record<string, string> = {};
    const save = (headers: Headers) => {
        for (const c of headers.getSetCookie()) {
            const [kv] = c.split(';', 1);
            const i = kv.indexOf('=');
            jar[kv.slice(0, i)] = kv.slice(i + 1);
        }
    };
    const headers = () => ({
        cookie: Object.entries(jar)
            .map(([k, v]) => `${k}=${v}`)
            .join('; '),
    });
    let url = target;
    /* oxlint-disable no-await-in-loop */
    for (let attempt = 0; attempt < 5; attempt++) {
        const response = await ofetch.raw(url, { headers: headers(), redirect: 'manual', ignoreResponseError: true });
        save(response.headers);
        if (response.status >= 300 && response.status < 400) {
            const location = new URL(response.headers.get('location')!, url).href;
            url = location === target || location.includes('bm-verify') ? location : target;
            continue;
        }
        const html: string = response._data;
        if (!html.includes('bm-verify')) {
            return html;
        }
        const seed = Number(/var i = (\d+)/.exec(html)![1]);
        const parts = /Number\("(\d+)" \+ "(\d+)"\)/.exec(html)!;
        const verify = await ofetch.raw('https://www.cia.gov/_sec/verify?provider=interstitial', {
            method: 'POST',
            headers: headers(),
            body: {
                'bm-verify': /"bm-verify": "([^"]+)"/.exec(html)![1],
                pow: seed + Number(parts[1] + parts[2]),
            },
            ignoreResponseError: true,
        });
        save(verify.headers);
        url = verify._data?.reload ? url.replace(/[&?]bm-verify=[^#]*/, '') : verify._data?.location ? new URL(verify._data.location, url).href : url;
    }
    throw new Error('Failed to pass Akamai');
};

async function handler() {
    const rootUrl = 'https://www.cia.gov';
    const currentUrl = `${rootUrl}/readingroom/foia-annual-report`;
    const response = await fetchPage(currentUrl);

    const $ = load(response);

    const items = $('.smaller-table tr')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const links = $item
                .find('td a')
                .toArray()
                .map((a) => `<a href="${new URL($(a).attr('href')!, rootUrl).href}">${$(a).text().trim()}</a>`);
            return {
                title: $item.find('td').eq(1).text().trim(),
                link: new URL($item.find('td a').attr('href')!, rootUrl).href,
                description: links.join('<br>'),
            };
        });

    return {
        title: 'CIA Annual FOIA Reports',
        link: currentUrl,
        item: items,
    };
}
