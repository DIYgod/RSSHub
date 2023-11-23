const { HOST } = require('./const');
const { getAccessToken, post } = require('./utils');

async function fetchActivityList(
    params = {
        pageNo: '1',
        pageSize: '20',
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
    return {
        items: resp.result.result.map((item) => ({
            title: item.title,
            link: `${HOST}/event/${item.id}`,
            description: `地点：${item.cityName} | ${item.siteName}`,
        })),
    };
}

// todo
async function fetchDictionary() {
    const accessToken = await getAccessToken();
    const resp = post('/web/activity/list/params', accessToken);
    return resp;
}

module.exports = {
    fetchActivityList,
    fetchDictionary,
};
