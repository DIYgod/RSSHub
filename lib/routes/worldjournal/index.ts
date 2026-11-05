import { type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.worldjournal.com';
const resolveLazyImage = (raw?: string) => {
    if (!raw) {
        return;
    }
    try {
        const proxyUrl = new URL(raw, baseUrl);
        const source = proxyUrl.searchParams.get('u');
        if (proxyUrl.pathname !== '/gw/photo.php' || !source) {
            return;
        }
        const imageUrl = new URL(source, baseUrl);
        return ['http:', 'https:'].includes(imageUrl.protocol) ? imageUrl.href : undefined;
    } catch {
        return;
    }
};
const parseListingDate = (raw: string) => {
    const parsed = raw ? parseDate(raw.trim(), 'YYYY-MM-DD HH:mm', true) : undefined;
    return parsed && !Number.isNaN(parsed.getTime()) ? timezone(parsed, 8) : undefined;
};
const parseStructuredDate = (raw?: string) => {
    if (!raw || !/(?:Z|[+-]\d{2}:\d{2})$/.test(raw)) {
        return;
    }
    const parsed = parseDate(raw);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};
const extractArticleDates = ($: CheerioAPI) => {
    const structuredData = $('script[type="application/ld+json"]')
        .toArray()
        .map((script) => $(script).text())
        .find((script) => /"@type"\s*:\s*"NewsArticle"/.test(script));
    // Unrelated text in the source JSON-LD can contain invalid control characters.
    const pubDate = parseStructuredDate(structuredData?.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1]);
    const updated = parseStructuredDate(structuredData?.match(/"dateModified"\s*:\s*"([^"]+)"/)?.[1]);
    return {
        ...(pubDate && { pubDate }),
        ...(updated && { updated }),
    };
};
export const route: Route = {
    path: '/:path{.+}?',
    categories: ['new-media'],
    example: '/worldjournal',
    parameters: { path: 'URL 中 `/wj/` 後的路徑，預設為 `cate/breaking`' },
    radar: [
        {
            source: ['worldjournal.com/wj/cate/*path'],
            target: '/cate/:path',
        },
    ],
    name: '新聞',
    maintainers: ['TonyRL'],
    handler,
    url: 'worldjournal.com/wj/cate/breaking',
};
async function handler(ctx) {
    const { path = 'cate/breaking' } = ctx.req.param();
    const { data: response } = await got(`${baseUrl}/wj/${path}`);
    const $ = load(response);
    const list = $('.subcate-list__wrapper .subcate-list__link__text')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const url = $item.find('a').attr('href');
            return {
                title: $item.find('h3').text(),
                description: $item.find('p').html(),
                link: url!.includes('?from=') ? url!.split('?from=', 1)[0] : url,
                pubDate: parseListingDate($item.find('.subcate-list__time--roc').text()),
            };
        });
    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(item.link!, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                $('[id^=div-gpt-ad], [class^=udn-ads-], .keywords, .next-page, .udn-ads, .article-content__ads--bd').remove();
                $('img').each((_, img) => {
                    const imageUrl = resolveLazyImage(img.attribs['data-src']);
                    if (!imageUrl) {
                        return;
                    }
                    img.attribs.src = imageUrl;
                    delete img.attribs['data-src'];
                });
                return {
                    description: $('.article-content__paragraph').html(),
                    category: $('meta[name=news_keywords]').attr('content')?.split(','),
                    author: $('.article-content__author').text().trim() || undefined,
                    ...extractArticleDates($),
                };
            })),
        }),
        { concurrency: 3 }
    );
    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        image: 'https://www.worldjournal.com/static/img/icons/icon-144x144.png',
        link: `${baseUrl}/wj/${path}`,
        item: items,
    };
}
