import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

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
const pageUrl = 'https://pvp.qq.com/web201706/newsdetail.shtml?tid=';
interface NewsItem {
    iNewsId: string;
    sTitle: string;
    sTargetIdxTime?: string;
    sIdxTime?: string;
    typeName: string;
}
const getPage = async (id: number, typeName: string): Promise<NewsItem[]> => {
    const response = await got(apiUrl + id, {
        headers: {
            Referer: link,
        },
    });
    const items: Array<Omit<NewsItem, 'typeName'>> = response.data.msg.result;
    return items.map((item) => ({ ...item, typeName }));
};
const renderItem = async (item: NewsItem): Promise<DataItem> => {
    const description = await cache.tryGet(`tencent:pvp-content:v1:${item.iNewsId}`, async () => {
        const response = await got(`https://apps.game.qq.com/wmp/v3.1/public/searchNews.php?p0=18&source=web_pc&id=${item.iNewsId}`);
        return JSON.parse(response.data.match(/(?<=var searchObj=).*(?<!;)/g)).msg.sContent;
    });
    const publishedAt = item.sTargetIdxTime || item.sIdxTime;
    return {
        title: `【${item.typeName}】` + item.sTitle,
        link: pageUrl + item.iNewsId,
        pubDate: publishedAt ? parseDateInTimezone(publishedAt, 8) : undefined,
        description,
    };
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
    const selected = map.get(type);
    if (!selected) {
        throw new InvalidParameterError(`Unknown news category "${type}". Use one of: ${map.keys().toArray().join(', ')}.`);
    }
    const OutName = selected.name;
    const OutId = selected.channelid;
    const channels = type === 'all' ? map.values().toArray() : [{ channelid: OutId, name: OutName }];
    const pages = await pMap(channels, (channel) => getPage(channel.channelid, channel.name), { concurrency: 3 });
    const entries = await pMap(pages.flat(), renderItem, { concurrency: 3 });
    const item = entries.filter((entry, index, items) => items.findIndex((other) => other.link === entry.link) === index);
    return {
        title: `【${OutName}】 - 王者荣耀 - 新闻列表`,
        link,
        description:
            '《王者荣耀》是腾讯天美工作室历时3年推出的东方英雄即时对战手游大作，抗塔强杀、团灭超神，领略爽热血竞技的酣畅淋漓！1v1、3v3、闯关等丰富游戏模式，随时战，更自由！跨服匹配秒开局，好友组队战排位，不靠装备、没有等级，更公平、更爽快的无差异对战！',
        item,
    };
}
