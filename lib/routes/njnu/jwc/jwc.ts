// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const util = require('./utils');

export default async (ctx) => {
    const type = ctx.req.param('type');
    let title, path;
    switch (type) {
        case 'jstz':
            title = '教师通知';
            path = 'jstz.htm';
            break;
        case 'xwdt':
            title = '新闻动态';
            path = 'xwdt.htm';
            break;
        case 'xstz':
            title = '学生通知';
            path = 'xstz.htm';
    }
    const base = 'http://jwc.njnu.edu.cn/index/' + path;

    const response = await got({
        method: 'get',
        url: base,
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = load(response.data);

    const list = $('.list_txt a').get();

    const result = await util.ProcessFeed(list, cache);

    ctx.set('data', {
        title: '南京师范大学教务处 - ' + title,
        link: 'http://jwc.njnu.edu.cn/',
        description: '南京师范大学教务处',
        item: result,
    });
};
