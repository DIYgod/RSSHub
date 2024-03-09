import { Route } from '@/types';
import got from '@/utils/got';
import { post2item } from './utils';
// 游戏id
const GITS_MAP = {
    1: '崩坏三',
    2: '原神',
    3: '崩坏二',
    4: '未定事件簿',
    6: '崩坏：星穹铁道',
    8: '绝区零',
};

// 公告类型
const TYPE_MAP = {
    1: '公告',
    2: '活动',
    3: '资讯',
};

export const route: Route = {
    path: '/bbs/official/:gids/:type?/:page_size?/:last_id?',
    categories: ['game'],
    example: '/mihoyo/bbs/official/2/3/20/',
    parameters: { gids: '游戏id', type: '公告类型，默认为 2(即 活动)', page_size: '分页大小，默认为 20 ', last_id: '跳过的公告数，例如指定为 40 就是从第 40 条公告开始，可用于分页' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '米游社 - 官方公告',
    maintainers: ['CaoMeiYouRen'],
    handler,
    description: `游戏 id

  | 崩坏三 | 原神 | 崩坏二 | 未定事件簿 | 星穹铁道 | 绝区零 |
  | ------ | ---- | ------ | ---------- | -------- | ------ |
  | 1      | 2    | 3      | 4          | 6        | 8      |

  公告类型

  | 公告 | 活动 | 资讯 |
  | ---- | ---- | ---- |
  | 1    | 2    | 3    |`,
};

async function handler(ctx) {
    const { gids, type = '2', page_size = '20', last_id = '' } = ctx.req.param();
    const query = new URLSearchParams({
        gids,
        type,
        page_size,
        last_id,
    }).toString();
    const url = `https://bbs-api.miyoushe.com/post/wapi/getNewsList?${query}`;
    const response = await got({
        method: 'get',
        url,
    });
    const list = response?.data?.data?.list;
    if (!list) {
        throw new Error('未获取到数据！');
    }
    const title = `米游社 - ${GITS_MAP[gids] || ''} - ${TYPE_MAP[type] || ''}`;
    const items = list.map((e) => post2item(e));
    const data = {
        title,
        link: url,
        item: items,
    };

    ctx.set('data', data);
}
