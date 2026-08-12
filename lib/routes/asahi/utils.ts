import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const rootUrl = 'https://www.asahi.com';

export const buildFeed = async (ctx: Context, currentUrl: string) => {
    const limit = Number(ctx.req.query('limit')) || 6;

    const response = await ofetch(currentUrl);

    const $ = load(response);

    $('.Time').remove();

    const slistVars = /slist_vars = (\{[^}]*\})/.exec(response)?.[1];

    let list: Array<{ link: string; title?: string; pubDate?: Date }>;

    if (slistVars) {
        const { theme, feature = '', pageper = '80' } = JSON.parse(slistVars.replaceAll(/([{,])\s*(\w+):/g, '$1"$2":'));
        const { docs } = await ofetch(`${rootUrl}/fusionlink/slist/`, {
            query: { theme, feature, pageper, page: 1 },
            headers: {
                referer: currentUrl,
                'x-requested-with': 'XMLHttpRequest',
            },
        });

        list = docs.slice(0, limit).map((doc) => ({
            link: doc.url,
            title: doc.title,
            pubDate: timezone(parseDate(doc.date, 'YYYYMMDDHHmmss'), 9),
        }));
    } else {
        const links = new Set(
            $('#MainInner .Section .List li a[href*="/articles/"]')
                .toArray()
                .map((item) => {
                    const url = new URL($(item).attr('href')!, currentUrl);
                    url.search = '';

                    return url.href;
                })
        );

        list = [...links].slice(0, limit).map((link) => ({ link }));
    }

    const items = (await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const content = load(detailResponse);

                content('.notPrint, svg').remove();

                const pubDate = content('meta[name="pubdate"]').attr('content');

                return {
                    ...item,
                    description: content('.nfyQp').html(),
                    title: content('meta[name="TITLE"]').attr('content') ?? item.title,
                    pubDate: pubDate ? parseDate(pubDate) : item.pubDate,
                };
            })
        )
    )) as DataItem[];

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        description: '朝日新聞社のニュースサイト、朝日新聞デジタルの社会ニュースについてのページです',
    };
};
