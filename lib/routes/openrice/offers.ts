import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { renderDescription } from './templates/description';

const baseUrl = 'https://www.openrice.com';

export const route: Route = {
    path: '/:lang/hongkong/offers',
    maintainers: ['after9'],
    handler,
    categories: ['shopping'],
    example: '/openrice/zh/hongkong/offers',
    parameters: { lang: '语言，缺省为 zh' },
    name: '香港餐廳精選優惠券',
    description: `
| 简体 | 繁體 | EN |
| ----- | ------ | ----- |
| zh-cn | zh | en |
  `,
};

async function handler(ctx) {
    const lang = ctx.req.param('lang') ?? 'zh';

    const apiPath = '/api/offers';
    let urlPath: string;
    switch (lang) {
        case 'zh-cn':
            urlPath = '/zh-cn/hongkong/offers';
            break;
        case 'en':
            urlPath = '/en/hongkong/offers';
            break;
        case 'zh':
        default:
            urlPath = '/zh/hongkong/offers';
            break;
    }
    const response = await ofetch(baseUrl + apiPath, {
        headers: {
            accept: 'application/json',
        },
        query: {
            uiLang: lang,
            uiCity: 'hongkong',
            page: 1,
            sortBy: 'PublishTime',
            couponTypeId: 1,
        },
    });
    const pageInfo = response.pageInfo;
    const highlightedOffers = response.highlightedOffers;
    const normalOffers = response.searchResult.paginationResult.results;
    const data = [...highlightedOffers, ...normalOffers];

    const resultList = data.map((item) => {
        const title = item.title ?? '';
        const link = baseUrl + item.urlUI;
        const coverImg = item.doorPhotoUI.urls.full ?? '';
        const descriptionText = item.couponType === 0 ? item.poiNameUI : `${item.desc} (${item.startTimeUI} - ${item.expireTimeUI}) [${item.multiplePoiDistrictName}]`;
        const description = renderDescription({
            description: descriptionText,
            image: coverImg,
        });
        return {
            title,
            description,
            link,
        };
    });

    return {
        title: pageInfo.seoInfo.title ?? 'OpenRice Hong Kong Offers',
        link: baseUrl + urlPath,
        description: pageInfo.seoInfo.metadataDictionary.name.find((item: { key: string; value: string }) => item.key === 'description')?.value ?? 'OpenRice Hong Kong Offers',
        item: resultList,
    };
}
