import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['other'],
    example: '/moxingfans',
    name: '新品信息',
    maintainers: ['cc798461'],
    handler,
};

async function handler() {
    const baseUrl = 'http://www.moxingfans.com/';
    const initResponse = await ofetch.raw(`${baseUrl}new`, {
        ignoreResponseError: true,
    });
    const cookie = initResponse.headers
        .getSetCookie()
        .map((c) => c.split(';', 1)[0])
        .join('; ');

    const response = await ofetch(`${baseUrl}new`, {
        headers: {
            cookie,
        },
    });
    const $ = load(response);

    const out = await Promise.all(
        $('article')
            .toArray()
            .map((item) => {
                const $a = $(item).find('header > h2 > a');
                const href = $a.attr('href');
                if (!href) {
                    return;
                }
                const link = new URL(href, baseUrl).href;
                const title = $a.text();

                return cache.tryGet(link, async () => {
                    const detailResponse = await ofetch(link, {
                        headers: {
                            cookie,
                        },
                    });
                    const $$ = load(detailResponse);

                    return {
                        title,
                        description: $$('article.article-content').html(),
                        link,
                        pubDate: timezone(parseDate($$('time').text()), 8),
                    };
                });
            })
            .filter((v) => v !== undefined)
    );

    return {
        title: '静态模型爱好者',
        link: baseUrl,
        item: out,
    };
}
