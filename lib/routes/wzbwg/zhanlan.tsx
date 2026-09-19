import { type CheerioAPI, load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

// Convert "YYYY年M月D日（-/——/—/至）[YYYY年]M月D日" into YYYY-MM-DD start/end dates
const parseExhibitionDuration = (raw: string): { startDate: string | undefined; endDate: string | undefined } => {
    const m = raw.match(/(\d{4})年(\d{1,2})月(\d{1,2})日[-—至]+(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日/);
    if (!m) {
        return { startDate: undefined, endDate: undefined };
    }
    const endYear = m[4] ?? m[1];
    return {
        startDate: `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`,
        endDate: `${endYear}-${m[5].padStart(2, '0')}-${m[6].padStart(2, '0')}`,
    };
};

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
    path: '/zhanlan/73',
    categories: ['travel'],
    example: '/wzbwg/zhanlan/73',
    radar: [
        {
            source: ['www.wzbwg.com/zhanlan/73/image'],
            target: '/zhanlan/73',
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

        const list = $('div.imglist div.slide')
            .toArray()
            .filter((item) => $(item).find('a[href^="/zhanlaninfo/"]'))
            .map((item) => {
                const $item = $(item);
                const a = $item.find('a[href^="/zhanlaninfo/"]');
                return {
                    title: a.attr('title') ?? '',
                    link: new URL(a.attr('href')!, baseUrl).href,
                    imgUrl: $item.find('div.imgbox img').attr('src') ?? '',
                };
            });

        const items = await Promise.all(
            list.map(({ imgUrl, ...item }) =>
                cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $detail = load(detailResponse);

                    const { fullDuration, location } = extractExhibitionMeta($detail);
                    const { startDate, endDate } = parseExhibitionDuration(fullDuration ?? '');

                    const dateRaw =
                        $detail('div.n2')
                            .text()
                            .match(/\[(.+?)\]/)?.[1] || '';
                    const pubDate = parseDate(dateRaw);

                    const description = renderToString(
                        <div>
                            <img src={imgUrl} />
                            <br />
                            <p>
                                <b>地点：</b>
                                {location || '参考详情'}
                            </p>
                            <p>
                                <b>开展：</b>
                                {startDate || '未定/常设'}
                            </p>
                            <p>
                                <b>闭展：</b>
                                {endDate || '未定/常设'}
                            </p>
                            {fullDuration && (
                                <p>
                                    <small>原始展期：{fullDuration}</small>
                                </p>
                            )}
                        </div>
                    );

                    return {
                        title: item.title,
                        link: item.link,
                        pubDate,
                        description,
                        _extra: {
                            museumName,
                            location,
                            startDate,
                            endDate,
                        },
                    };
                })
            )
        );

        return {
            title: `${museumName} - 最新展览`,
            link: listUrl,
            language: 'zh-CN',
            item: items as DataItem[],
        };
    },
};
