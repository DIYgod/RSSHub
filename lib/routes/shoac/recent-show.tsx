import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

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

    const list: Array<DataItem & { link: string; projectId: string; minPrice: number; maxPrice: number; placeCname: string }> = products.data.records.map((item) => ({
        title: item.productNameShort,
        category: [item.categoryName, item.subCategoryName],
        link: `${baseUrl}/#/detail?projectId=${item.projectId}`,
        projectId: item.projectId,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        placeCname: item.placeCname,
    }));

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`shoac:details:v2:${item.link}`, async () => {
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

                return {
                    detail: {
                        img: detail.data.img,
                        productSubtypeName: detail.data.productSubtypeName,
                        showStartToEndTime: detail.data.showStartToEndTime,
                        showPlaceName: detail.data.showPlaceName,
                        projectDesp: detail.data.projectDesp,
                    },
                    saleBeginTimeStr: show.data.showInfoDetailList?.[0]?.saleBeginTimeStr,
                };
            });
            const description = renderToString(
                <>
                    {details.detail.img ? (
                        <>
                            <img src={details.detail.img} />
                            <br />
                        </>
                    ) : null}
                    <table>
                        {details.saleBeginTimeStr ? (
                            <tr>
                                <td>售票时间：</td>
                                <td>{details.saleBeginTimeStr}</td>
                            </tr>
                        ) : null}
                        <tr>
                            <td>类型：</td>
                            <td>{details.detail.productSubtypeName}</td>
                        </tr>
                        <tr>
                            <td>时间：</td>
                            <td>{details.detail.showStartToEndTime}</td>
                        </tr>
                        <tr>
                            <td>地点：</td>
                            <td>
                                {details.detail.showPlaceName}-{item.placeCname}
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
                    {details.detail.projectDesp ? raw(details.detail.projectDesp) : null}
                </>
            );

            return { ...item, description };
        },
        { concurrency: 3 }
    );

    return {
        title: '演出月历 - 上海东方艺术中心管理有限公司',
        link: baseUrl,
        item: items,
    };
}
