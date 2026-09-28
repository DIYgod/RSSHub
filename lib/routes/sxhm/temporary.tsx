import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { parseDateRange } from '@/utils/parse-date-range';

import { namespace } from './namespace';

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
                        const detailData = await cache.tryGet<string>(link, async () => {
                            const detailRes = await got({
                                method: 'get',
                                url: link,
                            });
                            return detailRes.data;
                        });

                        const $detail = load(detailData);

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

                    const { startDate, endDate } = parseDateRange(fullDuration);
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
            item: items,
        };
    },
};
