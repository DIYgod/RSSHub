import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getPlaywrightPage } from '@/utils/playwright';
import { parseDate } from '@/utils/time';

export const fetchList = async (link: string, limit: number) => {
    const { page, destroy } = await getPlaywrightPage(link, {
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (['document', 'script'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
        },
        gotoConfig: { waitUntil: 'networkidle' },
    });

    let cookie: string;
    let response: string;
    try {
        cookie = (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join('; ');
        response = await page.content();
    } finally {
        await destroy();
    }

    const $ = load(response);
    const list = $('.list01 li')
        .toArray()
        .slice(0, limit)
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.attr('title')!,
                link: new URL(a.attr('href')!, link).href,
                date: $item.find('span').text(),
            };
        });

    return Promise.all(
        list.map(async (info) => ({
            title: info.title,
            link: info.link,
            description: await cache.tryGet(`yzu:article:description:${info.link}`, async () => {
                const detailResponse = await ofetch(info.link, {
                    headers: {
                        Cookie: cookie,
                        Referer: link,
                    },
                });
                const $detail = load(detailResponse);
                return $detail('.v_news_content').html()?.trim();
            }),
            pubDate: parseDate(info.date, 8),
        }))
    );
};
