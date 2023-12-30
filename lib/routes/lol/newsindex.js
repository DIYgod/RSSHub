const got = require('@/utils/got');
const map = new Map([
    ['zh', { name: '综合', channelid: '23' }],
    ['gg', { name: '公告', channelid: '24' }],
    ['ss', { name: '赛事', channelid: '25' }],
    ['gl', { name: '攻略', channelid: '27' }],
    ['sq', { name: '社区', channelid: '1934' }],
]);
const refererUrl = 'https://lol.qq.com/news/index.shtml';
const apiUrl = 'https://apps.game.qq.com/cmc/zmMcnTargetContentList?r0=jsonp&page=1&num=16&target=';
module.exports = async (ctx) => {
    const type = ctx.params.type || 'all';
    if (type === 'all') {
        const tasks = [];
        for (const value of map.values()) {
            tasks.push(getPage(value.channelid, value.name));
        }
        const results = await Promise.all(tasks);
        let items = [];
        results.forEach((result) => {
            items = items.concat(result);
        });
        ctx.state.data = {
            title: `【全部】 - 英雄联盟 - 新闻列表`,
            link: `https://lol.qq.com/news/index.shtml`,
            description: `英雄联盟官方网站，海量风格各异的英雄，丰富、便捷的物品合成系统，游戏内置的匹配、排行和竞技系统，独创的“召唤师”系统及技能、符文、天赋等系统组合，必将带你进入一个崭新而又丰富多彩的游戏世界。`,
            item: items,
        };
    } else {
        const OutName = map.get(type).name;
        const OutId = map.get(type).channelid;
        ctx.state.data = {
            title: `【${OutName}】 - 英雄联盟 - 新闻列表`,
            link: `https://lol.qq.com/news/index.shtml`,
            description: `英雄联盟官方网站，海量风格各异的英雄，丰富、便捷的物品合成系统，游戏内置的匹配、排行和竞技系统，独创的“召唤师”系统及技能、符文、天赋等系统组合，必将带你进入一个崭新而又丰富多彩的游戏世界。`,
            item: await getPage(OutId, OutName),
        };
    }
    async function getPage(id, typeName) {
        let list;
        if (id !== '1934') {
            // 非社区的数据处理，多了callback需要截取
            const response = (
                await got({
                    method: 'get',
                    url: apiUrl + id,
                    headers: {
                        Referer: refererUrl,
                    },
                })
            ).data.trim();
            try {
                const jsonString = response.slice(9, -2);
                list = JSON.parse(jsonString).data.result;
            } catch (error) {
                // console.error(error);
            }
        } else {
            // id=1934，社区的数据是另一个api
            const response = await got({
                method: 'get',
                url: 'https://apps.game.qq.com/cmc/cross?serviceId=3&source=zm&tagids=1934&typeids=1,2&withtop=yes&start=0&limit=16',
                headers: {
                    Referer: refererUrl,
                },
            });
            list = response.data.data.items;
        }
        function getUrl(sRedirectURL, iDocID, sVID) {
            // 由于数据源太多，具体的URL返回逻辑可以参考news/index.html页面里面的handleData方法

            if (sRedirectURL) {
                if (sRedirectURL.indexOf('?') > 0) {
                    sRedirectURL = sRedirectURL + '&docid=' + iDocID;
                } else {
                    sRedirectURL = sRedirectURL + '?docid=' + iDocID;
                }
            } else {
                if (sVID) {
                    sRedirectURL = 'http://lol.qq.com/v/v2/detail.shtml?docid=' + iDocID;
                } else {
                    sRedirectURL = 'http://lol.qq.com/news/detail.shtml?docid=' + iDocID;
                }
            }

            return sRedirectURL;
        }
        return list.map((item) => ({
            title: `【${typeName}】` + item.sTitle,
            link: getUrl(item.sRedirectURL, item.iDocID, item.sVID),
            pubDate: new Date(`${item.sCreated} UTC+8`).toUTCString(),
            guid: item.iDocID,
        }));
    }
};
