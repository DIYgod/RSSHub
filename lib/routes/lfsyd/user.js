const got = require('@/utils/got');
const date = require('@/utils/date');
const md5 = require('@/utils/md5');
module.exports = async (ctx) => {
    const id = ctx.params.id;
    const rootUrl = 'https://www.iyingdi.com';
    const listUrl = 'https://api.iyingdi.com/web/user/event-list';
    const infoUrL = 'https://api.iyingdi.com/web/post/info';
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const key = 'b8d5b38577b8bb382b0c783b474b95f9';
    const form = {
        event_types: 'content',
        page: 1,
        size: 15,
        timestamp: timestamp,
        user_id: id,
    };

    function get_form(form) {
        form.key = key;
        form.sign = md5(new URLSearchParams(form).toString());
        delete form.key;
    }
    get_form(form);

    const response = await got({
        method: 'post',
        url: listUrl,
        headers: {
            Host: 'api.iyingdi.com',
            'Login-Token': 'nologin',
            Origin: rootUrl,
            Platform: 'pc',
            Referer: `${rootUrl}/tz/people/${id}/postList`,
        },
        form: form,
    });
    const list = response.data.data;
    const nickname = list[0].author.nickname;

    const articleList = list.map((item) => ({
        title: item.event_data.title,
        pubDate: date(item.event_data.show_time * 1000, +8),
        link: item.event_data.post_id,
        guid: item.event_data.title,
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
        title: `${nickname} - 旅法师营地 `,
        link: `${rootUrl}/tz/people/${id}`,
        description: `${nickname} - 旅法师营地`,
        item: items,
    };
};
