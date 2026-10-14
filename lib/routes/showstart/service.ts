import { load } from 'cheerio';
import pMap from 'p-map';

import cache from '@/utils/cache';
import { evaluateScriptData } from '@/utils/evaluate-script';
import ofetch from '@/utils/ofetch';

import { HOST } from './const';
import { getAccessToken, post, sortBy, uniqBy } from './utils';

interface Activity {
    id: number | string;
    title: string;
    poster?: string;
    showTime?: string;
    cityName?: string;
    siteName?: string;
    performers?: string;
    price?: string;
}

interface ActivityDetail {
    content: string;
    picture?: string[];
    styles?: string;
}

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
    params.pageNo ||= '1';
    params.pageSize ||= '30';
    const accessToken = await getAccessToken();
    const resp = await post('/web/activity/list', accessToken, params);
    return formatActivities(resp.result.result);
}

const image = (src?: string) => (src ? `<img src="${src}" />` : '');
const time = (time?: string) => (time ? `<p>演出时间：${time}</p>` : '');
const address = (cityName?: string, siteName?: string) => (cityName || siteName ? `<p>地址：${[cityName, siteName].join(' - ')}</p>` : '');
const performers = (name?: string) => (name ? `<p>艺人：${name}</p>` : '');
const price = (price?: string) => (price ? `<p>票价：${price}</p>` : '');

async function formatActivity(item: Activity) {
    const link = `${HOST}/event/${item.id}`;
    const detail = await cache.tryGet(`showstart:details:v2:${link}`, async () => {
        const pageSource1 = await ofetch(link, { responseType: 'text' });
        const $ = load(pageSource1);
        const script = $('script')
            .toArray()
            .map((element) => $(element).html() || '')
            .find((source) => source.startsWith('window.__NUXT__='));
        if (!script) {
            throw new Error('ShowStart event page is missing its public detail data');
        }
        const data = await evaluateScriptData<{ data: Array<{ detail?: ActivityDetail }> }>(script, '__NUXT__');
        const detail = data.data[0]?.detail;
        if (!detail) {
            throw new Error('ShowStart event page is missing its event content');
        }
        return { content: detail.content, picture: detail.picture, styles: detail.styles };
    });
    const gallery = (detail.picture || []).filter((src) => src !== item.poster && !detail.content.includes(src));
    return {
        title: item.title,
        link,
        category: detail.styles?.split(',').filter(Boolean),
        description: [image(item.poster), time(item.showTime), address(item.cityName, item.siteName), performers(item.performers), price(item.price), detail.content, ...gallery.map(image)].join(''),
    };
}

function formatActivities(items: Activity[]) {
    return pMap(items, formatActivity, { concurrency: 3 });
}

async function fetchPerformerList(
    params: Partial<{
        pageNo: string;
        pageSize: string;
        searchKeyword: string;
        styleId: string;
    }>
) {
    params.pageNo ||= '1';
    params.pageSize ||= '30';
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
        activityList: await formatActivities(resp.result.activities),
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
        activityList: await formatActivities(resp.result.activities),
    };
}

async function fetchSiteList(
    params: Partial<{
        pageNo: string;
        pageSize: string;
        searchKeyword: string;
    }>
) {
    params.pageNo ||= '1';
    params.pageSize ||= '30';
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
    params.pageNo ||= '1';
    params.pageSize ||= '30';
    const accessToken = await getAccessToken();
    const resp = await post('/web/brand/list', accessToken, params);
    return resp.result.result.map((item) => ({
        title: item.name,
        link: `${HOST}/host/${item.id}`,
        description: `id: ${item.id}`,
    }));
}

interface City {
    cityCode: string;
    cityName: string;
    styles: Array<{ key: string; showName: string }>;
}

async function fetchParams(): Promise<{ result: City[] }> {
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

async function fetchDictionary(cityCode: string, showStyle?: string) {
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

export { fetchActivityList, fetchBrandInfo, fetchBrandList, fetchCityList, fetchDictionary, fetchPerformerInfo, fetchPerformerList, fetchSiteInfo, fetchSiteList, fetchStyleList };
