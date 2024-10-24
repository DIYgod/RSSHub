import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { art } from '@/utils/render';
import path from 'node:path';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);
const baseUrl = 'https://www.openrice.com';

export const route: Route = {
    path: '/:lang/hongkong/offers',
    maintainers: ['after9'],
    handler,
    categories: ['shopping'],
    example: '/openrice/zh/hongkong/promos',
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

    let title;
    let description;
    const urlPath = '/api/offers';
    switch (lang) {
        case 'zh':
            title = '開飯喇 - 精選優惠券';
            description = 'OpenRice香港精選優惠券';
            break;
        case 'zh-cn':
            title = '开饭喇 - 精选优惠券';
            description = 'OpenRice香港精选优惠券';
            break;
        case 'en':
            title = 'Openrice - Hong Kong Coupon Search';
            description = 'Hong Kong Coupon Search from Openrice';
            break;
        default:
            title = '開飯喇 - 精選優惠券';
            description = 'OpenRice香港精選優惠券';
            break;
    }
    const response = await ofetch(baseUrl + urlPath, {
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
    const highlightedOffers = response.highlightedOffers;
    const normalOffers = response.searchResult.paginationResult.results;
    const data = [...highlightedOffers, ...normalOffers];

    const resultList = data.map((item) => {
        const title = item.title ?? '';
        const link = baseUrl + item.urlUI;
        const coverImg = item.doorPhotoUI.url ?? '';
        const descriptionText = item.couponType === 0 ? item.poiNameUI : `${item.desc} (${item.startTimeUI} - ${item.expireTimeUI}) [${item.multiplePoiDistrictName}]`;
        const description = art(path.join(__dirname, 'templates/description.art'), {
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
        title,
        link: baseUrl + urlPath,
        description,
        item: resultList,
    };
}
