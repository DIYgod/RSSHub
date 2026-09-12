import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { PRESETS } from '@/utils/header-generator';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/board/:id',
    categories: ['other'],
    example: '/dcinside/board/programming',
    parameters: { id: 'board id' },
    name: 'board',
    maintainers: ['zfanta'],
    handler,
};

const domain = 'https://m.dcinside.com';

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const link = `${domain}/board/${id}`;

    const response = await ofetch(link, {
        headerGeneratorOptions: PRESETS.MODERN_ANDROID,
    });
    const $ = load(response);

    const items = await Promise.all(
        $('body > div > div > div > section > ul.gall-detail-lst > li:not([class]) > div > a.lt')
            .toArray()
            .map((row) => {
                const itemLink = row.attribs.href;

                return cache.tryGet(itemLink, async () => {
                    const detailResponse = await ofetch(itemLink, {
                        headerGeneratorOptions: PRESETS.MODERN_ANDROID,
                    });
                    const content = load(detailResponse);

                    return {
                        title: content('head title').text().trim(),
                        pubDate: parseDate(content('body > div.container > div > div > section > div.gallview-tit-box > div > ul > li:nth-child(2)').text()),
                        link: itemLink,
                        description: content('body > div.container > div > div > section > div.gall-thum-btm > div > div.thum-txt').html(),
                    };
                });
            })
    );

    return {
        title: $('head title').text(),
        description: $('head title').text(),
        link,
        item: items,
    };
}
