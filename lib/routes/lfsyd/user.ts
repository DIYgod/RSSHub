// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { ProcessForm, ProcessFeed } = require('./utils');

export default async (ctx) => {
    const id = ctx.req.param('id');
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
        form: ProcessForm(form),
    });

    const { data } = response.data;
    const { nickname } = data[0].author;

    const articleList = data.map((item) => ({
        title: item.event_data.title,
        pubDate: parseDate(item.event_data.show_time * 1000),
        link: `${rootUrl}/tz/post/${item.event_data.post_id}`,
        guid: item.event_data.title,
        postId: item.event_data.post_id,
    }));

    const items = await ProcessFeed(cache, articleList);

    ctx.set('data', {
        title: `${nickname} - 旅法师营地 `,
        link: `${rootUrl}/tz/people/${id}`,
        item: items,
    });
};
