// @ts-nocheck
import got from '@/utils/got';
const { DATA_MAP, RANKING_TYPE_MAP } = require('./static-data');
const { post2item } = require('./utils');

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

export default async (ctx) => {
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
    ctx.set('data', data);
};
