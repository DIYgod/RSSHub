import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

// parse exhibition date string like "2024年5月1日 - 2024年6月30日" or "2024年5月1日-" or "2024年5月1日 - 6月30日"
const parseExhibitionDates = (fullDuration: string | undefined) => {
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (fullDuration) {
        // Regex to capture start and optional end dates.
        const dateRegex = /(\d{4})年(\d{1,2})月(\d{1,2})日(?:\D+(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日)?/;
        const match = fullDuration.match(dateRegex);

        if (match) {
            const startYear = match[1];
            startDate = `${startYear}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;

            if (match[5] && match[6]) {
                const endYear = match[4] || startYear; // If end year is not present, use start year
                endDate = `${endYear}-${match[5].padStart(2, '0')}-${match[6].padStart(2, '0')}`;
            }
        }
    }

    return { startDate, endDate };
};

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

        const typeMap: Record<string, string> = {
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
        const nuxtDataStr = $('#__NUXT_DATA__').text() || ''; // use __NUXT_DATA__ to get the data structure of the page
        const nuxtData = JSON.parse(nuxtDataStr);
        const targetType = typeMap[typeParam];

        const exhibitionList = nuxtData.filter((item: any) => {
            if (typeof item === 'object' && 'eid' in item) {
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
                    const detailNuxtDataStr = detail$('#__NUXT_DATA__').text() || '';
                    const detailNuxtData = JSON.parse(detailNuxtDataStr);

                    const detailObj = detailNuxtData.find((obj: any) => typeof obj === 'object' && 'address' in obj);

                    const location = detailNuxtData[detailObj.address];
                    const fullDuration = detailNuxtData[detailObj.open_time];
                    const { startDate, endDate } = parseExhibitionDates(fullDuration);
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
                    } as DataItem;
                })
            )
        );

        return {
            title: `${museumName} - 展览陈列${targetType ? ` - ${targetType}` : ''}`,
            link: apiUrl,
            language: 'zh-CN',
            item: items as DataItem[],
        };
    },
};
