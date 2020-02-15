const got = require('@/utils/got');

module.exports = async (ctx) => {
    const data = (
        await got({
            method: 'post',
            url: 'https://app-api.shop.ele.me/arena/invoke/?method=NoticeKeeperService.getBroadcastList',
            json: {
                id: '5CC2B32FA6F24CF78CB300DDE2F370BE|1565511577423',
                metas: {
                    appName: 'Odin',
                    appVersion: '4.4.0',
                },
                service: 'NoticeKeeperService',
                method: 'getBroadcastList',
                params: {
                    offset: 0,
                    limit: 999,
                },
                ncp: '2.0.0',
            },
        })
    ).data;

    ctx.state.data = {
        title: '饿了么商家开放平台-公告',
        link: 'https://open.shop.ele.me/openapi/publicnotice/0',
        item: data.result.broadcastList.map((item) => ({
            title: item.title,
            description: '',
            pubDate: item.beginDate,
            link: `https://open.shop.ele.me/openapi/publicnotice/${item.templateId}`,
        })),
    };
};
