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

    const parts = durationStr.split(/[-—~]+/).map((p) => p.trim());
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
    path: '/exhibitions',
    categories: ['travel'],
    example: '/sdmuseum/exhibitions',
    parameters: {},
    name: 'Temporary Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.sdmuseum.com/col/col271702/index.html'],
            target: '/exhibitions',
        },
    ],

    handler: async () => {
        const baseUrl = 'https://www.sdmuseum.com';
        const apiUrl = `${baseUrl}/col/col271702/index.html`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await got({
            method: 'get',
            url: apiUrl,
        });

        const $ = load(response.data, {
            xml: true, // use xmlMode to preserve CDATA sections inside <script>
        });

        const items = await Promise.all(
            $('record')
                .toArray()
                .map((el) => {
                    const itemHtml = $(el).text();
                    const $item = load(itemHtml);

                    const title = $item('.ltit a').attr('title');
                    const link = new URL($item('.ltit a').attr('href')!, baseUrl).href;
                    const imgUrlRaw = $item('.img img').attr('src') || '';
                    const imgUrl = new URL(imgUrlRaw, baseUrl).href;

                    const location = $item('.item.add').text().trim();
                    const fullDuration = $item('.item.time').text().trim();
                    const fullDurationDate = fullDuration.replace(/开展时间\s*[:：]\s*/, '').trim(); // use regex to remove "开展时间" prefix if it exists, so replace is used here.

                    const { startDate, endDate } = extractDates(fullDurationDate);

                    // get pubDate from the detail page
                    return cache.tryGet(link, async () => {
                        const detailResponse = await got({
                            method: 'get',
                            url: link,
                        });
                        const $detail = load(detailResponse.data);

                        const pubDateStr = $detail('meta[name="PubDate"]').attr('content') || '';
                        const pubDate = parseDate(pubDateStr, 'YYYY-MM-DD HH:mm');

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
                            _extra: {
                                museumName,
                                title,
                                location,
                                startDate,
                                endDate,
                                itemLink: link,
                            },
                        };
                    });
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
