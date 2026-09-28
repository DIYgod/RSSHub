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
    path: '/exhibition/:type?',
    categories: ['travel'],
    example: '/capitalmuseum/exhibition',
    parameters: {
        type: 'Exhibition type, supported values: new(最新展览), review(展览回顾), default: All exhibitions.',
    },
    name: 'Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.capitalmuseum.org.cn/exhibition'],
            target: '/exhibition',
        },
    ],

    handler: async (ctx) => {
        const typeParam = ctx.req.param('type') || 'all';

        const typeMap = {
            new: '最新展览',
            review: '展览回顾',
        };

        const baseUrl = 'https://www.capitalmuseum.org.cn';
        const apiUrl = `${baseUrl}/exhibition`;
        const museumName = namespace.zh?.name || namespace.name;

        const response = await got({
            method: 'get',
            url: apiUrl,
        });

        const $ = load(response.data);
        const nuxtDataStr = $('#__NUXT_DATA__').text(); // use __NUXT_DATA__ to get the data structure of the page
        const nuxtData = JSON.parse(nuxtDataStr);
        const targetType = typeMap[typeParam];

        const exhibitionList = nuxtData.filter((item: any) => {
            if (item instanceof Object && 'eid' in item) {
                const itemType = nuxtData[item.cid];
                // when typeParam is 'all', include all items; otherwise, filter by the specific type
                return typeParam === 'all' ? Object.values(typeMap).includes(itemType) : itemType === targetType;
            }
            return false;
        });

        interface ExhibitionListItem {
            title: string;
            itemlink: string;
            imgUrl: string;
        }

        const listItems: ExhibitionListItem[] = exhibitionList.map((item: any) => {
            const eid = nuxtData[item.eid];
            const title = nuxtData[item.title];
            const link = `${apiUrl}/${eid}`;
            const imgUrl = nuxtData[item.titileurl];

            return {
                title,
                itemlink: link,
                imgUrl,
            };
        });

        // get location and fullDuration from the detail page of each exhibition
        const items: DataItem[] = await Promise.all(
            listItems.map((item: ExhibitionListItem) =>
                cache.tryGet(item.itemlink, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.itemlink,
                    });

                    const detail$ = load(detailResponse.data);
                    const detailNuxtDataStr = detail$('#__NUXT_DATA__').text();
                    const detailNuxtData = JSON.parse(detailNuxtDataStr);

                    const detailObj = detailNuxtData.find((obj: any) => obj instanceof Object && 'address' in obj);

                    const location = detailNuxtData[detailObj.address];
                    const fullDuration = detailNuxtData[detailObj.open_time];
                    const { startDate, endDate } = parseDateRange(fullDuration);
                    const pubDate = startDate ? timezone(parseDate(startDate, 'YYYY-MM-DD'), 8) : undefined;

                    const description = renderToString(
                        <div>
                            <img src={item.imgUrl} />
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
                        link: item.itemlink,
                        pubDate,
                        description,
                        // For further .ics file processing
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
            title: `${museumName} - 展览陈列${targetType ? ` - ${targetType}` : ''}`,
            link: apiUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
