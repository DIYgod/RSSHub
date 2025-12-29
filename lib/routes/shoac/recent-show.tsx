import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/recent-show',
    categories: ['shopping'],
    example: '/shoac/recent-show',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['shoac.com.cn/'],
        },
    ],
    name: '演出月历',
    maintainers: ['TonyRL'],
    handler,
    url: 'shoac.com.cn/',
};

async function handler() {
    const baseUrl = 'https://www.shoac.com.cn';

    const headers = {
        Channel: 'theatre_pc',
        Location: '121.458563,31.250315',
        Theater: 1323,
        'Flagship-Store': true,
    };

    const { data: products } = await got.post(`${baseUrl}/platform-backend/good/theater/dongyi-products`, {
        headers,
        json: {
            page: 1,
            size: 12,
            calendar: false,
            timeSort: true,
            venueId: '',
        },
    });

    const list = products.data.records.map((item) => ({
        title: item.productNameShort,
        category: [item.categoryName, item.subCategoryName],
        link: `${baseUrl}/#/detail?projectId=${item.projectId}`,
        projectId: item.projectId,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        placeCname: item.placeCname,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detail } = await got(`${baseUrl}/platform-backend/good/project/detail/old/${item.projectId}`, {
                    headers,
                    searchParams: {
                        distributionSeriesId: '',
                        distributionChannelId: '',
                    },
                });
                const { data: show } = await got(`${baseUrl}/platform-backend/good/shows/old/${item.projectId}`, {
                    headers,
                    searchParams: {
                        distributionSeriesId: '',
                        distributionChannelId: '',
                    },
                });

                item.description = renderToString(
                    <>
                        {detail.data.img ? (
                            <>
                                <img src={detail.data.img} />
                                <br />
                            </>
                        ) : null}
                        <table>
                            <tr>
                                <td>类型：</td>
                                <td>{detail.data.productSubtypeName}</td>
                            </tr>
                            <tr>
                                <td>时间：</td>
                                <td>{detail.data.showStartToEndTime}</td>
                            </tr>
                            <tr>
                                <td>地点：</td>
                                <td>
                                    {detail.data.showPlaceName}-{item.placeCname}
                                </td>
                            </tr>
                            <tr>
                                <td>￥</td>
                                <td>
                                    {item.minPrice}-{item.maxPrice}
                                </td>
                            </tr>
                        </table>
                        <br />
                        {detail.data.projectDesp ? raw(detail.data.projectDesp) : null}
                    </>
                );
                item.pubDate = show.data.showInfoDetailList ? parseDate(show.data.showInfoDetailList[0].saleBeginTime, 'x') : null;

                return item;
            })
        )
    );

    return {
        title: '演出月历 - 上海东方艺术中心管理有限公司',
        link: baseUrl,
        item: items,
    };
}
