// @ts-nocheck
const { getNoticeList } = require('./utils');

const url = 'https://www.njxzc.edu.cn/89/list.htm';
const host = 'https://www.njxzc.edu.cn';

export default async (ctx) => {
    const out = await getNoticeList(
        ctx,
        url,
        host,
        'a',
        '.news_meta',
        {
            title: '.arti_title',
            content: '.wp_articlecontent',
            date: '.arti_update',
        },
        '.news_list .news'
    );

    ctx.set('data', {
        title: '南京晓庄学院 -- 通知公告',
        link: url,
        item: out,
    });
};
