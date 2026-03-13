import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const map = new Map([
    ['rm', { name: '热门', channelid: 1760 }],
    ['xw', { name: '新闻', channelid: 1761 }],
    ['gg', { name: '公告', channelid: 1762 }],
    ['hd', { name: '活动', channelid: 1763 }],
    ['ss', { name: '赛事', channelid: 1764 }],
    ['yh', { name: '优化', channelid: 1769 }],
    ['all', { name: '全部', channelid: 0 }],
]);
const link = 'https://pvp.qq.com/web201706/newsindex.shtml';
const apiUrl = 'https://apps.game.qq.com/wmp/v3.1/?p0=18&p1=searchNewsKeywordsList&order=sIdxTime&r0=cors&type=iTarget&source=app_news_search&pagesize=12&page=1&id=';
const pageUrl = `https://pvp.qq.com/web201706/newsdetail.shtml?tid=`;

const getPage = async (id, typeName) => {
    const response = await got(apiUrl + id, {
        headers: {
            Referer: link,
        },
    });

    return Promise.all(
        response.data.msg.result.map(async (item) => {
            let description = await got(`https://apps.game.qq.com/wmp/v3.1/public/searchNews.php?p0=18&source=web_pc&id=${item.iNewsId}`);

            description = JSON.parse(description.data.match(/(?<=var searchObj=).*(?<!;)/g));

            return {
                title: `【${typeName}】` + item.sTitle,
                link: pageUrl + item.iNewsId,
                pubDate: parseDate(item.sTargetIdxTime),
                description: description.msg.sContent,
            };
        })
    );
};

export const route: Route = {
    path: '/pvp/newsindex/:type',
    categories: ['game'],
    example: '/tencent/pvp/newsindex/all',
    parameters: { type: '栏目分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻中心',
    maintainers: ['Jeason0228', 'HenryQW'],
    handler,
    description: `| 全部 | 热门 | 新闻 | 公告 | 活动 | 赛事 | 优化 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| all  | rm   | xw   | gg   | hd   | ss   | yh   |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const OutName = map.get(type).name;
    const OutId = map.get(type).channelid;

    let item = [];

    if (type === 'all') {
        const results = await Promise.all(
            [...map].map(async (value) => {
                const res = await getPage(value[1].channelid, value[1].name);
                return res;
            })
        );
        for (const result of results) {
            item = [...item, ...result];
        }
    } else {
        item = await getPage(OutId, OutName);
    }

    return {
        title: `【${OutName}】 - 王者荣耀 - 新闻列表`,
        link,
        description: `《王者荣耀》是腾讯天美工作室历时3年推出的东方英雄即时对战手游大作，抗塔强杀、团灭超神，领略爽热血竞技的酣畅淋漓！1v1、3v3、闯关等丰富游戏模式，随时战，更自由！跨服匹配秒开局，好友组队战排位，不靠装备、没有等级，更公平、更爽快的无差异对战！`,
        item,
    };
}
