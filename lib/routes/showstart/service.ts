import { HOST } from './const';
import { getAccessToken, post, sortBy, uniqBy } from './utils';

async function fetchActivityList(
    params: Partial<{
        pageNo: string;
        pageSize: string;
        cityCode: string;
        activityIds: string;
        coupon: string;
        keyword: string;
        organizerId: string;
        performerId: string;
        showStyle: string;
        showTime: string;
        showType: string;
        siteId: string;
        sortType: string;
        themeId: string;
        timeRange: string;
        tourId: string;
        type: string;
        tag: string;
    }>
) {
    params.pageNo = params.pageNo || '1';
    params.pageSize = params.pageSize || '30';
    const accessToken = await getAccessToken();
    const resp = await post('/web/activity/list', accessToken, params);
    return resp.result.result.map((item) => formatActivity(item));
}

const image = (src: string) => (src ? `<img src="${src}" />` : '');
const time = (time: string) => (time ? `<p>演出时间：${time}</p>` : '');
const address = (cityName: string, siteName: string) => (cityName || siteName ? `<p>地址：${[cityName, siteName].join(' - ')}</p>` : '');
const performers = (name: string) => (name ? `<p>艺人：${name}</p>` : '');
const price = (price: string) => (price ? `<p>票价：${price}</p>` : '');

function formatActivity(item) {
    return {
        title: item.title,
        link: `${HOST}/event/${item.id}`,
        description: [image(item.poster), time(item.showTime), address(item.cityName, item.siteName), performers(item.performers), price(item.price)].join(''),
    };
}

async function fetchPerformerList(
    params: Partial<{
        pageNo: string;
        pageSize: string;
        searchKeyword: string;
        styleId: string;
    }>
) {
    params.pageNo = params.pageNo || '1';
    params.pageSize = params.pageSize || '30';
    const accessToken = await getAccessToken();
    const resp = await post('/web/performer/list', accessToken, params);
    return resp.result.result.map((item) => ({
        title: item.name,
        link: `${HOST}/artist/${item.id}`,
        description: `id: ${item.id}`,
    }));
}

async function fetchPerformerInfo(params: { performerId: string }) {
    const accessToken = await getAccessToken();
    const resp = await post('/web/performer/info', accessToken, params);
    return {
        id: params.performerId,
        name: resp.result.name,
        content: resp.result.content,
        avatar: resp.result.avatar,
        poster: resp.result.poster,
        styles: resp.result.styles,
        activityList: resp.result.activities.map((item) => formatActivity(item)),
    };
}

async function fetchBrandInfo(params: { brandId: string }) {
    const accessToken = await getAccessToken();
    const resp = await post('/web/brand/info', accessToken, params);
    return {
        id: params.brandId,
        name: resp.result.name,
        content: resp.result.content,
        avatar: resp.result.avatar,
        poster: resp.result.poster,
        activityList: resp.result.activities.map((item) => formatActivity(item)),
    };
}

async function fetchSiteList(
    params: Partial<{
        pageNo: string;
        pageSize: string;
        searchKeyword: string;
    }>
) {
    params.pageNo = params.pageNo || '1';
    params.pageSize = params.pageSize || '30';
    const accessToken = await getAccessToken();
    const resp = await post('/web/site/list', accessToken, params);
    return resp.result.result.map((item) => ({
        title: `${item.cityName} - ${item.name}`,
        link: `${HOST}/venue/${item.id}`,
        description: `id: ${item.id}`,
    }));
}

async function fetchSiteInfo(params: { siteId: string }) {
    const accessToken = await getAccessToken();
    const resp = await post('/web/site/info', accessToken, params);
    return {
        id: params.siteId,
        name: `${resp.result.cityName} - ${resp.result.name}`,
        address: resp.result.address,
        avatar: resp.result.avatar,
        poster: resp.result.poster,
    };
}

async function fetchBrandList(
    params: Partial<{
        pageNo: string;
        pageSize: string;
        searchKeyword: string;
    }>
) {
    params.pageNo = params.pageNo || '1';
    params.pageSize = params.pageSize || '30';
    const accessToken = await getAccessToken();
    const resp = await post('/web/brand/list', accessToken, params);
    return resp.result.result.map((item) => ({
        title: item.name,
        link: `${HOST}/host/${item.id}`,
        description: `id: ${item.id}`,
    }));
}

async function fetchParams() {
    const accessToken = await getAccessToken();
    return post('/web/activity/list/params', accessToken);
}

async function fetchCityList(keyword = '') {
    const resp = await fetchParams();
    const cities = sortBy(resp.result, 'cityCode');
    return cities
        .filter((item) => item.cityName.includes(keyword.trim()))
        .map((item) => ({
            title: item.cityName,
            link: `${HOST}/event/list?cityCode=${item.cityCode}`,
            description: `cityCode: ${item.cityCode}`,
        }));
}

// styles is embed in each city item
// so we need to fetch all city items and then extract styles from them
async function fetchStyleList(keyword = '') {
    const resp = await fetchParams();
    let styles = resp.result.flatMap((item) => item.styles) as Array<{ key: string; showName: string }>;
    styles = uniqBy(styles, 'key');
    styles = sortBy(styles, 'key');
    return styles
        .filter((item) => item.showName.includes(keyword.trim()))
        .map((item) => ({
            title: item.showName,
            link: `${HOST}/event/list?showStyle=${item.key}`,
            description: `showStyle: ${item.key}`,
        }));
}

async function fetchDictionary(cityCode: string, showStyle: string) {
    const resp = await fetchParams();
    const target = resp.result.find((item) => String(item.cityCode) === cityCode);
    if (!target) {
        return {};
    }
    return {
        cityName: target.cityName,
        showName: target.styles.find((item) => String(item.key) === showStyle)?.showName,
    };
}

export { fetchActivityList, fetchCityList, fetchStyleList, fetchPerformerList, fetchPerformerInfo, fetchSiteList, fetchSiteInfo, fetchBrandList, fetchBrandInfo, fetchDictionary };
