const got = require('@/utils/got');
const util = require('./utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const rootUrl = 'https://www.iyingdi.com';
    const listUrl = 'https://api.iyingdi.com/web/user/event-list';
    const form = {
        event_types: 'content',
        page: 1,
        size: 15,
        timestamp: '',
        user_id: id,
    };

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
        form: util.getForm(form),
    });
    const list = response.data.data;
    const nickname = list[0].author.nickname;

    const articleList = list.map((item) => ({
        title: item.event_data.title,
        pubDate: parseDate(item.event_data.show_time * 1000),
        link: `${rootUrl}/tz/post/${item.event_data.post_id}`,
        guid: item.event_data.title,
        postId: item.event_data.post_id,
    }));

    const items = await Promise.all(articleList.map(async (item) => await util.ProcessFeed(ctx, item)));

    ctx.state.data = {
        title: `${nickname} - 旅法师营地 `,
        link: `${rootUrl}/tz/people/${id}`,
        description: `${nickname} - 旅法师营地`,
        item: items,
    };
};
