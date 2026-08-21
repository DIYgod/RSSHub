import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { ProcessFeed, ProcessForm } from './utils';

export const route: Route = {
    path: '/tag/:tagId?',
    categories: ['game'],
    example: '/lfsyd/tag/17',
    parameters: { tagId: '订阅分区类型' },
    description: `| 炉石传说 | 万智牌 | 游戏王 | 昆特牌 | 影之诗 | 符文之地传奇 | 阴阳师百闻牌 |
| :------: | :----: | :----: | :----: | :----: | :----------: | :----------: |
|    17    |   18   |   16   |   19   |   20   |      329     |      221     |

| 英雄联盟 | 电子游戏 | 桌面游戏 | 卡牌游戏 | 玩家杂谈 | 二次元 |
| :------: | :------: | :------: | :------: | :------: | :----: |
|    112   |    389   |    24    |    102   |    23    |   117  |`,
    radar: [
        {
            source: ['mob.iyingdi.com/fine/:tagId'],
            target: '/tag/:tagId',
        },
    ],
    name: '分区',
    maintainers: ['auto-bot-ty'],
    handler,
    url: 'www.iyingdi.com/',
};

async function handler(ctx) {
    const tagId = ctx.req.param('tagId');
    const tagList = {
        17: '炉石传说',
        18: '万智牌',
        16: '游戏王',
        19: '昆特牌',
        20: '影之诗',
        329: '符文之地传奇',
        221: '阴阳师百闻牌',
        112: '英雄联盟',
        389: '电子游戏',
        24: '桌面游戏',
        102: '卡牌游戏',
        23: '玩家杂谈',
        117: '二次元',
    };
    const tagName = tagList[tagId];
    const rootUrl = 'https://www.iyingdi.com';
    const tagUrl = 'https://api.iyingdi.com/web/feed/tag-content-list';
    const form = {
        page: 1,
        size: 30,
        tag_id: tagId,
        timestamp: '',
        version: 0,
    };

    const response = await got({
        method: 'post',
        url: tagUrl,
        headers: {
            Host: 'api.iyingdi.com',
            'Login-Token': 'nologin',
            Origin: rootUrl,
            Platform: 'pc',
            Referer: `${rootUrl}/`,
        },
        form: ProcessForm(form),
    });

    const { list } = response.data;
    const tagJson = JSON.parse(list[0].feed.tag_json);

    const articleList = list.map((item) => ({
        title: item.feed.title,
        pubDate: parseDate(item.feed.show_time * 1000),
        link: `${rootUrl}/tz/post/${item.feed.source_id}`,
        guid: item.feed.title,
        postId: item.feed.source_id,
    }));

    const items = await ProcessFeed(cache, articleList);

    return {
        title: `${tagName || tagJson[0].tag} - 旅法师营地 `,
        link: `${rootUrl}/tz/tag/${tagId}`,
        item: items,
    };
}
