const got = require('@/utils/got');
const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.iyingdi.com';
    const url = 'https://api.iyingdi.com/mweb/feed/recommend-content-list';
    const form = {
        size: 30,
        timestamp: '',
    };
    const response = await got({
        method: 'post',
        url,
        headers: {
            'App-Udid': 'unknown',
            Host: 'api.iyingdi.com',
            'Login-Token': 'nologin',
            Origin: 'https://mob.iyingdi.com',
            Platform: 'mweb',
            Preid: '86f2007de00272e24a54831a621aecc5',
            Referer: 'https://mob.iyingdi.com/',
        },
        form: utils.ProcessForm(form, 'mweb'),
    });
    const list = response.data.posts;

    const articleList = list.map((item) => ({
        title: item.post.title,
        pubDate: parseDate(item.post.show_time * 1000),
        link: `${rootUrl}/tz/post/${item.post.id}`,
        guid: item.post.title,
        postId: item.post.id,
    }));
    const items = await Promise.all(articleList.map(async (item) => await utils.ProcessFeed(ctx, item)));

    ctx.state.data = {
        title: '首页 - 旅法师营地',
        link: rootUrl,
        item: items,
    };
};
