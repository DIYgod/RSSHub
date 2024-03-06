import { HOST } from './const';
import { getAccessToken, post, sortBy, uniqBy } from './utils';

async function fetchActivityList(
    params = {
        pageNo: '1',
        pageSize: '30',
        cityCode: '',
        activityIds: '',
        coupon: '',
        keyword: '',
        organizerId: '',
        performerId: '',
        showStyle: '',
        showTime: '',
        showType: '',
        siteId: '',
        sortType: '',
        themeId: '',
        timeRange: '',
        tourId: '',
        type: '',
        tag: '',
    }
) {
    const accessToken = await getAccessToken();
    const resp = await post('/web/activity/list', accessToken, params);
    return resp.result.result.map((item) => formatActivity(item));
}

const image = (src) => (src ? `<img src="${src}" />` : '');
const time = (time) => (time ? `<p>演出时间：${time}</p>` : '');
const address = (cityName, siteName) => (cityName || siteName ? `<p>地址：${[cityName, siteName].join(' - ')}</p>` : '');
const performers = (name) => (name ? `<p>艺人：${name}</p>` : '');
const price = (price) => (price ? `<p>票价：${price}</p>` : '');

function formatActivity(item) {
    return {
        title: item.title,
        link: `${HOST}/event/${item.id}`,
        description: [image(item.poster), time(item.showTime), address(item.cityName, item.siteName), performers(item.performers), price(item.price)].join(''),
    };
}

async function fetchPerformerList(
    params = {
        pageNo: '1',
        pageSize: '30',
        searchKeyword: '',
        styleId: '',
    }
) {
    const accessToken = await getAccessToken();
    const resp = await post('/web/performer/list', accessToken, params);
    return resp.result.result.map((item) => ({
        title: item.name,
        link: `${HOST}/artist/${item.id}`,
        description: `id: ${item.id}`,
    }));
}

async function fetchPerformerInfo(
    params = {
        performerId: '',
    }
) {
    const accessToken = await getAccessToken();
    const resp = await post('/web/performer/info', accessToken, params);
    return {
        id: params.id,
        name: resp.result.name,
        content: resp.result.content,
        avatar: resp.result.avatar,
        poster: resp.result.poster,
        styles: resp.result.styles,
        activityList: resp.result.activities.map((item) => formatActivity(item)),
    };
}

async function fetchBrandInfo(
    params = {
        brandId: '',
    }
) {
    const accessToken = await getAccessToken();
    const resp = await post('/web/brand/info', accessToken, params);
    return {
        id: params.id,
        name: resp.result.name,
        content: resp.result.content,
        avatar: resp.result.avatar,
        poster: resp.result.poster,
        activityList: resp.result.activities.map((item) => formatActivity(item)),
    };
}

async function fetchBrandList(
    params = {
        pageNo: '1',
        pageSize: '30',
        searchKeyword: '',
    }
) {
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
    let styles = resp.result.flatMap((item) => item.styles);
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

async function fetchDictionary(cityCode, showStyle) {
    const resp = await fetchParams();
    const target = resp.result.find((item) => item.cityCode === cityCode);
    if (!target) {
        return {};
    }
    return {
        cityName: target.cityName,
        showName: target.styles.find((item) => item.key === showStyle)?.showName,
    };
}

export { fetchActivityList, fetchCityList, fetchStyleList, fetchPerformerList, fetchPerformerInfo, fetchBrandList, fetchBrandInfo, fetchDictionary };
