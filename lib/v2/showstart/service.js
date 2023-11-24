const { HOST } = require('./const');
const { getAccessToken, post } = require('./utils');

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

    const image = (src) => (src ? `<img src="${src}" />` : '');
    const time = (time) => (time ? `<p>演出时间：${time}</p>` : '');
    const address = (cityName, siteName) => (cityName || siteName ? `<p>地址：${[cityName, siteName].join(' - ')}</p>` : '');
    const performers = (name) => (name ? `<p>艺人：${name}</p>` : '');
    const price = (price) => (price ? `<p>票价：${price}</p>` : '');

    return {
        items: resp.result.result.map((item) => ({
            title: item.title,
            link: `${HOST}/event/${item.id}`,
            description: [image(item.poster), time(item.showTime), address(item.cityName, item.siteName), performers(item.performers), price(item.price)].join(''),
        })),
    };
}

async function fetchDictionary(cityCode, showStyle) {
    const accessToken = await getAccessToken();
    const resp = await post('/web/activity/list/params', accessToken);
    const target = resp.result.find((item) => item.cityCode === cityCode);
    if (!target) {
        return {};
    }
    return {
        cityName: target.cityName,
        showName: target.styles.find((item) => item.key === showStyle)?.showName,
    };
}

module.exports = {
    fetchActivityList,
    fetchDictionary,
};
