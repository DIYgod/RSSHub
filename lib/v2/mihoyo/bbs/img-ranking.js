const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const { DATA_MAP, RANKING_TYPE_MAP } = require('./static-data');

const renderDescription = (description, images) => art(path.join(__dirname, '../templates/description.art'), { description, images });

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

module.exports = async (ctx) => {
    const { game } = ctx.params;
    const routeParams = Object.fromEntries(new URLSearchParams(ctx.params.routeParams));
    const { forumType: forum_type = 'tongren', cateType: cate_type, rankingType: ranking_type, lastId: last_id = '' } = routeParams;
    const page_size = ctx.query.limit || '20';
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
    const items = list.map((e) => {
        const author = e.user.nickname;
        const title = e.post.subject;
        const link = `https://bbs.mihoyo.com/ys/article/${e.post.post_id}`;
        let describe = e.post.content || '';
        try {
            describe = JSON.parse(e.post.content).describe;
        } catch (error) {
            if (!(error instanceof SyntaxError)) {
                throw error;
            }
        }
        const description = renderDescription(describe || '', [e.post.cover, ...e.post.images]);
        const pubDate = parseDate(e.post.created_at * 1000);
        return {
            author,
            title,
            link,
            description,
            pubDate,
        };
    });
    const data = {
        title,
        link: url,
        item: items,
    };
    ctx.state.data = data;
};
