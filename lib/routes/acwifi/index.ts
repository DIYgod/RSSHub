import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/',
    categories: ['other'],
    example: '/acwifi',
    name: '新闻',
    maintainers: ['cc798461'],
    features: {
        antiCrawler: true,
    },
    handler,
};

const toHex = (s: string) => Buffer.from(s).toString('hex');

const getCookie = async (url: string) => {
    const init = await ofetch.raw(url);
    const sessionVerify = init.headers
        .getSetCookie()
        .map((c) => c.split(';', 1)[0])
        .find((c) => c.startsWith('security_session_verify='));
    if (!sessionVerify) {
        return '';
    }

    const verify = await ofetch.raw(`${url}?security_verify_data=${toHex('1920,1080')}`, {
        headers: { Cookie: `${sessionVerify}; srcurl=${toHex(url)}` },
    });
    const midVerify = verify.headers
        .getSetCookie()
        .map((c) => c.split(';', 1)[0])
        .find((c) => c.startsWith('security_session_mid_verify='));

    return midVerify ? `${sessionVerify}; ${midVerify}` : sessionVerify;
};

async function handler() {
    const baseUrl = 'https://www.acwifi.net/';
    const cookie = await getCookie(baseUrl);
    const response = await ofetch(baseUrl, { headers: { Cookie: cookie } });
    const $ = load(response);

    const list = $('h2')
        .toArray()
        .map((item) => {
            const $a = $(item).find('a');
            return {
                title: $a.text(),
                link: $a.attr('href')!,
            };
        });

    const out = await Promise.all(
        list.map(({ title, link }) =>
            cache.tryGet(link, async () => {
                const response = await ofetch(link, {
                    headers: { Cookie: cookie },
                });
                const $ = load(response);
                const content = $('article.article-content');
                content.find('code-block').remove();
                return {
                    title,
                    description: content.html(),
                    link,
                };
            })
        )
    );

    return { title: '路由器交流', link: baseUrl, item: out };
}
