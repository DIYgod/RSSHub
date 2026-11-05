import { type CheerioAPI, load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { parseDateRange } from '@/utils/parse-date-range';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

// Extract exhibition date and location from detail page txt div
const extractExhibitionMeta = ($detail: CheerioAPI) => {
    let fullDuration: string | undefined;
    let location: string | undefined;

    $detail('div.info div.txt p, div.info div.txt strong').each((_, el) => {
        const text = $detail(el).text();
        if (!fullDuration && (text.includes('时间：') || text.includes('展期：'))) {
            fullDuration = text.split('：', 2)[1];
        }
        if (!location && (text.includes('地点：') || text.includes('展地：'))) {
            location = text.split('：', 2)[1];
        }
    });

    return { fullDuration, location };
};

export const route: Route = {
    path: '/zhanlan/specialexhibition',
    categories: ['travel'],
    example: '/wzbwg/zhanlan/specialexhibition',
    radar: [
        {
            source: ['www.wzbwg.com/zhanlan/73/image'],
            target: '/zhanlan/specialexhibition',
        },
    ],
    name: '最新展览',
    maintainers: ['magazian'],
    handler: async () => {
        const baseUrl = 'https://www.wzbwg.com';
        const listUrl = `${baseUrl}/zhanlan/73/image`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await ofetch(listUrl);
        const $ = load(response);

        const list = $('div.imglist div.slide a[href^="/zhanlaninfo/"]')
            .toArray()
            .map((item) => {
                const a = $(item);
                return {
                    title: a.attr('title') ?? '',
                    link: new URL(a.attr('href')!, baseUrl).href,
                    imgUrl: a.find('div.imgbox img').attr('src') ?? '',
                };
            });

        const items = await pMap(
            list,
            async ({ imgUrl, ...item }) => {
                const detail = await cache.tryGet(item.link, async () => {
                    const detailResponse = await ofetch(item.link);
                    const $detail = load(detailResponse);
                    const { fullDuration, location } = extractExhibitionMeta($detail);
                    const { startDate, endDate } = parseDateRange(fullDuration ?? '');
                    const dateRaw =
                        $detail('div.n2')
                            .text()
                            .match(/\[(.+?)\]/)?.[1]
                            ?.trim() || '';
                    const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? timezone(parseDate(dateRaw, 'YYYY-MM-DD', true), 8) : undefined;
                    const pubDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined;
                    return { pubDate, location, startDate, endDate, description: $detail('.info .txt').html() || undefined };
                });
                const { pubDate, location, startDate, endDate } = detail;
                const description = renderToString(
                    <div>
                        {imgUrl && <img src={imgUrl} />}
                        <div dangerouslySetInnerHTML={{ __html: detail.description || '' }} />
                    </div>
                );
                return {
                    ...item,
                    pubDate,
                    description,
                    _extra: { museumName, location, startDate, endDate },
                };
            },
            { concurrency: 3 }
        );

        return {
            title: `${museumName} - 最新展览`,
            link: listUrl,
            language: 'zh-CN',
            item: items as DataItem[],
        };
    },
};
