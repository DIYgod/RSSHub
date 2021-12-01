const got = require('@/utils/got');

const host = 'https://gateway-api-ipv4.dushu365.com/compose-orch/' + 'offlineActivity/v100/activity/list';

const itemLink = 'https://card.dushu.io/requirement/offline-activity' + '/activity-detail/v/index.html';

const link = 'https://card.dushu.io/requirement/offline-activity/host-home' + '/v/index.html?webview-type=rn&hostId=xtntzsnwsnkw511r';

module.exports = async (ctx) => {
    const response = await got
        .post(host, {
            json: {
                channelTid: 'xtntzsnwsnkw511r',
                pageNo: 1,
                pageSize: 10,
                type: 0,
            },
        })
        .json();

    const data = response.data.activityListVOS;

    ctx.state.data = {
        title: '樊登福州运营中心',
        link,
        item: data.map((item) => ({
            title: item.activityName,
            link: itemLink + '?productId=' + item.activityId + '&type=' + item.type,
            description: '地区：' + item.areaName + '<br>' + '地点：' + item.address + '<br>' + '<img style="heigth:500px;width:500px" src="' + item.posterImg + '">',
        })),
    };
};
