import { Route } from '@/types';
import got from '@/utils/got';
import { DATA_MAP, RANKING_TYPE_MAP } from './static-data';
import { post2item } from './utils';

const getGameInfo = (game) => ({
    gids: DATA_MAP[game]?.gids,
    title: DATA_MAP[game]?.title,
});
const getForumInfo = (game, forum_type) => {
    forum_type = forum_type || DATA_MAP[game]?.default_forum || 'tongren';
    const forum = DATA_MAP[game]?.forums?.[forum_type];
    return {
        forum_id: forum?.forum_id,
        title: `${forum?.title}榜`,
    };
};
const getCateInfo = (game, forum_type, cate_type) => {
    forum_type = forum_type || DATA_MAP[game]?.default_forum || 'tongren';
    const forum = DATA_MAP[game]?.forums?.[forum_type];
    const default_cate = forum?.default_cate;
    if (!default_cate) {
        return {
            title: '',
            cate_id: '0',
        };
    }
    cate_type = cate_type || default_cate;
    return {
        title: `${forum?.cates?.[cate_type]?.title}榜`,
        cate_id: forum?.cates?.[cate_type]?.cate_id,
    };
};
const getRankingTypeInfo = (game, ranking_type) => {
    ranking_type = ranking_type || DATA_MAP[game]?.default_ranking_type || 'daily';
    return {
        id: RANKING_TYPE_MAP[ranking_type]?.id,
        title: RANKING_TYPE_MAP[ranking_type]?.title,
    };
};

export const route: Route = {
    path: '/bbs/img-ranking/:game/:routeParams?',
    categories: ['game'],
    example: '/mihoyo/bbs/img-ranking/ys/forumType=tongren&cateType=illustration&rankingType=daily',
    parameters: { game: '游戏缩写', routeParams: '额外参数；请参阅以下说明和表格' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['miyoushe.com/:game/imgRanking/:forum_id/:ranking_id/:cate_id'],
            target: '/bbs/img-ranking/:game',
        },
    ],
    name: '米游社 - 同人榜',
    maintainers: ['CaoMeiYouRen'],
    handler,
    description: `| 键          | 含义                                  | 接受的值                                                             | 默认值       |
| ----------- | ------------------------------------- | -------------------------------------------------------------------- | ------------ |
| forumType   | 主榜类型（仅原神、大别野有 cos 主榜） | tongren/cos                                                          | tongren      |
| cateType    | 子榜类型（仅崩坏三、原神有子榜）      | 崩坏三：illustration/comic/cos；原神：illustration/comic/qute/manual | illustration |
| rankingType | 排行榜类型（崩坏二没有日榜）          | daily/weekly/monthly                                                 | daily        |
| lastId      | 当前页 id（用于分页）                 | 数字                                                                 | 1            |

  游戏缩写

| 崩坏三 | 原神 | 崩坏二 | 未定事件簿 | 星穹铁道 | 大别野 | 绝区零 |
| ------ | ---- | ------ | ---------- | -------- | ------ | ------ |
| bh3    | ys   | bh2    | wd         | sr       | dby    | zzz    |

  主榜类型

| 同人榜  | COS 榜 |
| ------- | ------ |
| tongren | cos    |

  子榜类型

  崩坏三 子榜

| 插画         | 漫画  | COS |
| ------------ | ----- | --- |
| illustration | comic | cos |

  原神 子榜

| 插画         | 漫画  | Q 版 | 手工   |
| ------------ | ----- | ---- | ------ |
| illustration | comic | qute | manual |

  排行榜类型

| 日榜  | 周榜   | 月榜    |
| ----- | ------ | ------- |
| daily | weekly | monthly |`,
};

async function handler(ctx) {
    const game = ctx.req.param('game');
    const routeParams = Object.fromEntries(new URLSearchParams(ctx.req.param('routeParams')));
    const { forumType: forum_type = 'tongren', cateType: cate_type, rankingType: ranking_type, lastId: last_id = '' } = routeParams;
    const page_size = ctx.req.query('limit') || '20';
    const { gids, title: game_title } = getGameInfo(game);
    if (!gids) {
        throw new Error('未知的游戏！');
    }
    const { forum_id, title: forum_title } = getForumInfo(game, forum_type);
    if (!forum_id) {
        throw new Error(`${game_title} 的排行榜不存在！`);
    }
    const { cate_id, title: cate_title } = getCateInfo(game, forum_type, cate_type);
    const { id: type, title: type_title } = getRankingTypeInfo(game, ranking_type);
    const query = new URLSearchParams({
        gids,
        forum_id,
        cate_id,
        type,
        page_size,
        last_id,
    }).toString();
    const url = `https://bbs-api.miyoushe.com/post/wapi/getImagePostList?${query}`;
    const response = await got({
        method: 'get',
        url,
    });
    const list = response?.data?.data?.list;
    if (!list) {
        throw new Error('未获取到数据！');
    }
    const title = `米游社-${game_title}-${forum_title}${cate_title ? `-${cate_title}` : ''}-${type_title}`;
    const items = list.map((e) => post2item(e));
    const data = {
        title,
        link: url,
        item: items,
    };
    return data;
}
