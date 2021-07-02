const got = require('@/utils/got');
const util = require('./utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const tagId = ctx.params.tag;
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
        form: util.getForm(form),
    });
    const list = response.data.list;
    const tagJson = JSON.parse(list[0].feed.tag_json);

    const articleList = list.map((item) => ({
        title: item.feed.title,
        pubDate: parseDate(item.feed.show_time * 1000),
        link: `${rootUrl}/tz/post/${item.feed.source_id}`,
        guid: item.feed.title,
        postId: item.feed.source_id,
    }));

    const items = await Promise.all(articleList.map(async (item) => await util.ProcessFeed(ctx, item)));

    ctx.state.data = {
        title: `${!tagName ? tagJson[0].tag : tagName} - 旅法师营地 `,
        link: `${rootUrl}/tz/tag/${tagId}`,
        description: `${!tagName ? tagJson[0].tag : tagName} - 旅法师营地 `,
        item: items,
    };
};
