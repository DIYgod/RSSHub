import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export const route: Route = {
    path: '/:category',
    categories: ['game'],
    example: '/zhangyoubao/lol',
    parameters: { category: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['mobile.zhangyoubao.com/:category/'],
    },
    name: '推荐',
    maintainers: ['ztmzzz'],
    handler,
    description: `| 英雄联盟 | 炉石传说 | DNF | 守望先锋 | 王者荣耀 | 单机综合 | 手游综合 | 云顶之弈 | 部落冲突 | 皇室战争 | DNF 手游 | 荒野乱斗   |
  | -------- | -------- | --- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ---------- |
  | lol      | lscs     | dnf | swxf     | yxzj     | steam    | mobile   | lolchess | blzz     | hszz     | dnfm     | brawlstars |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const map = new Map([
        ['lol', { title: '英雄联盟', id: 1 }],
        ['lscs', { title: '炉石传说', id: 2 }],
        ['dnf', { title: 'DNF', id: 3 }],
        ['swxf', { title: '守望先锋', id: 15 }],
        ['yxzj', { title: '王者荣耀', id: 38 }],
        ['steam', { title: '单机综合', id: 59 }],
        ['mobile', { title: '手游综合', id: 62 }],
        ['lolchess', { title: '云顶之弈', id: 67 }],
        ['blzz', { title: '部落冲突', id: 91 }],
        ['hszz', { title: '皇室战争', id: 106 }],
        ['dnfm', { title: 'DNF手游', id: 116 }],
        ['brawlstars', { title: '荒野乱斗', id: 129 }],
    ]);
    const url = 'https://platform.service.zhangyoubao.com/service/rest';
    const res = await got
        .post(url, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'api=recommend.list&apiVersion=v2&game=platform&os=ios&params[game_tag_id]=' + map.get(category).id,
        })
        .json();
    const items = res.data.map((item) => ({
        title: item.article.title,
        link: 'https://mobile.zhangyoubao.com/' + category + '/article/' + item.article.id_for_web,
        description: art(path.join(__dirname, 'templates/article.art'), { image: item.article.recommend_covers[0] }),
        pubDate: parseDate(item.article.publish_time, 'X'),
    }));

    return {
        title: '掌游宝' + map.get(category).title + '分区',
        link: 'https://mobile.zhangyoubao.com/' + category,
        description: '掌游宝' + map.get(category).title + '分区',
        item: items,
    };
}
