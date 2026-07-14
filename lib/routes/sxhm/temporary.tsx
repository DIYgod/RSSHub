import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

// format the date to YYYY-MM-DD and handle missing year or month
const extractDates = (durationStr: string) => {
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (!durationStr) {
        return { startDate, endDate };
    }

    const parts = durationStr.split(/[-—~至]+/).map((p) => p.trim());
    const startStr = parts[0];
    const endStr = parts[1];

    let startYear: string | undefined;
    let startMonth: string | undefined;

    const startRegex = /(\d{4})年(\d{1,2})月(\d{1,2})日/;
    const startMatch = startStr.match(startRegex);

    if (startMatch) {
        startYear = startMatch[1];
        startMonth = startMatch[2].padStart(2, '0');
        const startDay = startMatch[3].padStart(2, '0');
        startDate = `${startYear}-${startMonth}-${startDay}`;
    }

    if (endStr && startDate) {
        const endRegex = /(?:(\d{4})年)?(?:(\d{1,2})月)?(\d{1,2})日/;
        const endMatch = endStr.match(endRegex);

        if (endMatch) {
            const matchYear = endMatch[1];
            const matchMonth = endMatch[2]?.padStart(2, '0');
            const matchDay = endMatch[3].padStart(2, '0');

            const finalEndYear = matchYear || startYear;
            const finalEndMonth = matchMonth || startMonth;
            const finalEndDay = matchDay;
            endDate = `${finalEndYear}-${finalEndMonth}-${finalEndDay}`;
        }
    }

    return { startDate, endDate };
};

export const route: Route = {
    path: '/temporary',
    categories: ['travel'],
    example: '/sxhm/temporary',
    parameters: {},
    name: 'Special Exhibition', // use sxhm's EN version name
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.sxhm.com/Temporary.html'],
            target: '/temporary',
        },
    ],

    handler: async () => {
        const baseUrl = 'https://www.sxhm.com';
        const apiUrl = `${baseUrl}/Temporary.html`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await got({
            method: 'get',
            url: apiUrl,
        });

        const $ = load(response.data);

        const items = await Promise.all(
            $('.temporary_exhibition2 .list .item')
                .toArray()
                .map(async (el) => {
                    const $item = $(el);

                    const $a = $item.find('.text .t1');
                    const link = new URL($a.attr('href')!, baseUrl).href;
                    const imgUrlRaw = $item.find('.pic img.i').attr('src') || '';
                    const imgUrl = new URL(imgUrlRaw, baseUrl).href;

                    let title = $a.text();

                    const $pEls = $item.find('.text .t2 .p');
                    let fullDuration = $pEls.eq(0).text().replaceAll('时间：', '').trim();
                    const location = $pEls.eq(1).text().replaceAll('地点：', '').trim();

                    // if title or duration ends with ..., need to fetch the detail page to get the full info
                    if (title.endsWith('...') || fullDuration.endsWith('...')) {
                        const detailData = await cache.tryGet(link, async () => {
                            const detailRes = await got({
                                method: 'get',
                                url: link,
                            });
                            return detailRes.data;
                        });

                        const $detail = load(detailData as string);

                        const detailTitle = $detail('.universal2 .title, .universal3 .tbox .title').text();
                        if (detailTitle) {
                            title = detailTitle;
                        }

                        const detailDuration = $detail('.universal2 .txt_box .infor .item .t').eq(0).text().trim();
                        if (detailDuration) {
                            fullDuration = detailDuration;
                        }
                    }

                    // get title from “”
                    const titleMatch = title.match(/“(.+?)”/);
                    if (titleMatch) {
                        title = titleMatch[1];
                    }

                    const { startDate, endDate } = extractDates(fullDuration);
                    const pubDate = startDate ? parseDate(startDate) : undefined;

                    const description = renderToString(
                        <div>
                            <img src={imgUrl} />
                            <br />
                            <p>
                                <b>地点：</b>
                                {location}
                            </p>
                            <p>
                                <b>开展：</b>
                                {startDate ?? '未定/常设'}
                            </p>
                            <p>
                                <b>闭展：</b>
                                {endDate ?? '未定/常设'}
                            </p>
                            {fullDuration && (
                                <p>
                                    <small>原始展期：{fullDuration}</small>
                                </p>
                            )}
                        </div>
                    );

                    return {
                        title,
                        link,
                        pubDate,
                        description,
                        // For further .ics file processing
                        _extra: {
                            museumName,
                            title,
                            location,
                            startDate, // format: YYYY-MM-DD or '未定/常设'
                            endDate, // format: YYYY-MM-DD or '未定/常设'
                            itemLink: link,
                        },
                    };
                })
        );

        return {
            title: `${museumName} - 临时展览`,
            link: apiUrl,
            language: 'zh-CN',
            item: items as DataItem[],
        };
    },
};
