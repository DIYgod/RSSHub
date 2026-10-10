import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { parseDateRange } from '@/utils/parse-date-range';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

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

                    const title = $item('.ltit a').attr('title')!;
                    const link = new URL($item('.ltit a').attr('href')!, baseUrl).href;
                    const imgUrlRaw = $item('.img img').attr('src') || '';
                    const imgUrl = new URL(imgUrlRaw, baseUrl).href;

                    const location = $item('.item.add').text().trim();
                    const fullDuration = $item('.item.time').text().trim();
                    const fullDurationDate = fullDuration.replace(/开展时间\s*[:：]\s*/, '').trim(); // use regex to remove "开展时间" prefix if it exists, so replace is used here.

                    const { startDate, endDate } = parseDateRange(fullDurationDate);

                    // get pubDate from the detail page
                    return cache.tryGet(link, async (): Promise<DataItem> => {
                        const detailResponse = await got({
                            method: 'get',
                            url: link,
                        });
                        const $detail = load(detailResponse.data);

                        const pubDateStr = $detail('meta[name="PubDate"]').attr('content') || '';
                        const pubDate = timezone(parseDate(pubDateStr, 'YYYY-MM-DD HH:mm'), 8);

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
            item: items,
        };
    },
};
