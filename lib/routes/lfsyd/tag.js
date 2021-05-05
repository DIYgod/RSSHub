const got = require('@/utils/got');
const date = require('@/utils/date');
const md5 = require('@/utils/md5');
const cache = require('./cache');

module.exports = async (ctx) => {
    const tag_id = ctx.params.tag;
    const tag_list = {
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
    const tag_name = tag_list[tag_id];
    const rootUrl = 'https://www.iyingdi.com';
    const tagUrl = 'https://api.iyingdi.com/web/feed/tag-content-list';
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const key = 'b8d5b38577b8bb382b0c783b474b95f9';
    const form = {
        page: 1,
        size: 30,
        tag_id: tag_id,
        timestamp: timestamp,
        version: 0,
    };

    function get_form(form) {
        form.key = key;
        form.sign = md5(new URLSearchParams(form).toString());
        delete form.key;
    }
    get_form(form);

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
        form: form,
    });
    const list = response.data.list;
    const tag_json = JSON.parse(list[0].feed.tag_json);

    const articleList = list.map((item) => ({
        title: item.feed.title,
        pubDate: date(item.feed.show_time * 1000, +8),
        link: `${rootUrl}/tz/post/${item.feed.source_id}`,
        guid: item.feed.title,
        post_id: item.feed.source_id,
    }));

    const items = await Promise.all(
        articleList.map(async (item) => {
            const info_form = {
                post_id: item.post_id,
                timestamp: timestamp,
            };
            get_form(info_form);
            item.description = await cache.getContentFromLink(ctx, item.link, rootUrl, info_form);
            delete item.post_id;
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `${!tag_name ? tag_json[0].tag : tag_name} - 旅法师营地 `,
        link: `${rootUrl}/tz/tag/${tag_id}`,
        description: `${!tag_name ? tag_json[0].tag : tag_name} - 旅法师营地 `,
        item: items,
    };
};

