const got = require('@/utils/got');
const map = new Map([
    ['rm', { name: '热门', channelid: 1760 }],
    ['xw', { name: '新闻', channelid: 1761 }],
    ['gg', { name: '公告', channelid: 1762 }],
    ['hd', { name: '活动', channelid: 1763 }],
    ['ss', { name: '赛事', channelid: 1764 }],
    // ['all', { name: '全部', channelid: 0 }],
]);
const refererUrl = 'https://pvp.qq.com/web201706/newsindex.shtml';
const apiUrl = 'https://apps.game.qq.com/wmp/v3.1/?p0=18&p1=searchNewsKeywordsList&order=sIdxTime&r0=cors&type=iTarget&source=app_news_search&pagesize=12&page=1&id=';
const pageUrl = `https://pvp.qq.com/web201706/newsdetail.shtml?tid=`;
module.exports = async (ctx) => {
    const type = ctx.params.type;
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
            title: `【全部】 - 王者荣耀 - 新闻列表`,
            link: `https://pvp.qq.com/web201706/newsindex.shtml`,
            description: `《王者荣耀》是腾讯天美工作室历时3年推出的东方英雄即时对战手游大作，抗塔强杀、团灭超神，领略爽热血竞技的酣畅淋漓！1v1、3v3、闯关等丰富游戏模式，随时战，更自由！跨服匹配秒开局，好友组队战排位，不靠装备、没有等级，更公平、更爽快的无差异对战！`,
            item: items,
        };
    } else {
        const OutName = map.get(type).name;
        const OutId = map.get(type).channelid;
        // const OutData = map.get(type).dataArr;
        ctx.state.data = {
            title: `【${OutName}】 - 王者荣耀 - 新闻列表`,
            link: `https://pvp.qq.com/web201706/newsindex.shtml`,
            description: `《王者荣耀》是腾讯天美工作室历时3年推出的东方英雄即时对战手游大作，抗塔强杀、团灭超神，领略爽热血竞技的酣畅淋漓！1v1、3v3、闯关等丰富游戏模式，随时战，更自由！跨服匹配秒开局，好友组队战排位，不靠装备、没有等级，更公平、更爽快的无差异对战！`,
            item: await getPage(OutId, OutName),
        };
    }
    async function getPage(id, typeName) {
        const response = await got({
            method: 'get',
            url: apiUrl + id,
            headers: {
                Referer: refererUrl,
            },
        });
        const list = response.data.msg.result;
        return list.map((item) => {
            const single = {
                title: `【${typeName}】` + item.sTitle,
                link: pageUrl + item.iNewsId,
                pubDate: new Date(`${item.sTargetIdxTime} GMT`).toUTCString(),
                guid: item.iNewsId,
            };
            return single;
        });
    }
};
