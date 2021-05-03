const got = require('@/utils/got');
const date = require('@/utils/date');
const md5 = require('@/utils/md5');

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
    const infoUrL = 'https://api.iyingdi.com/web/post/info';
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

    const articleList = list.map((item) => ({
        title: item.feed.title,
        pubDate: date(item.feed.show_time * 1000, +8),
        link: item.feed.source_id,
        guid: item.feed.title,
    }));

    const items = await Promise.all(
        articleList.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const info_form = {
                        post_id: item.link,
                        timestamp: timestamp,
                    };
                    get_form(info_form);

                    const response = await got({
                        method: 'post',
                        url: infoUrL,
                        headers: {
                            Host: 'api.iyingdi.com',
                            'Login-Token': 'nologin',
                            Origin: rootUrl,
                            Platform: 'pc',
                            Referer: '${rootUrl}/',
                        },
                        form: info_form,
                    });
                    const content_body = JSON.parse(response.body);
                    item.description = content_body.post.content;
                    item.link = `${rootUrl}/tz/post/${content_body.post.id}`;

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${tag_name} - 旅法师营地 `,
        link: `${rootUrl}/tz/tag/${tag_id}`,
        description: `${tag_name} - 旅法师营地 `,
        item: items,
    };
};
