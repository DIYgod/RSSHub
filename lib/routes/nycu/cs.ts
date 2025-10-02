import { Data, Route } from '@/types';
import timezone from '@/utils/timezone';
import { CheerioAPI, load } from 'cheerio';
import { Context } from 'hono';
import ofetch from '@/utils/ofetch';

async function handler(ctx: Context): Promise<Data> {
    const catagory = ctx.req.param('category') ?? 'all';
    const url = `https://www.cs.nycu.edu.tw/announcements/${catagory === 'all' ? '' : catagory}`;

    const $ = await ofetch<CheerioAPI>(url, {
        parseResponse: load,
    });

    const item = $('.announcement-item')
        .toArray()
        .map((e) => ({
            title: $('header a', e).text().trim(),
            link: $('a', e).attr('href'),
            pubDate: $('time', e).attr('datetime') ? timezone($('time', e).attr('datetime') || '', 8) : undefined,
        }));

    return {
        title: `陽明交大資工系公告 - ${catagory}`,
        description: `國立陽明交大資訊學院公告 - ${catagory}`,
        language: 'zh-TW',
        link: url,
        item,
    };
}

export const route: Route = {
    name: '資訊學院公告',
    categories: ['university'],
    maintainers: ['simbafs'],
    description: `|    名稱    |       Name       |    :category     |
| :--------: | :--------------: | :--------------: |
|  全部公告  |       All        |       all        |
|   獎學金   |   Scholarships   |   scholarship    |
| 課程/演講  |     Courses      |     courses      |
|   研究所   |    Graduates     |     graduate     |
|   學士班   |  Undergraduates  |  undergraduate   |
|  入學公告  |    Admissions    |    candidate     |
|  獲獎捷報  |      Awards      |      awards      |
|  系內徵才  |   Internal Job   |      campus      |
|  企業徵才  |   Industry Job   |   corporation    |
|   系計中   | Computer Center  |       cscc       |
|  活動競賽  |     activity     |     activity     |
| 資訊人院刊 | NYC CCS MAGAZINE | NYC CCS MAGAZINE |`,
    path: '/cs/:category?',
    parameters: { category: 'categories, see below' },
    example: '/nycu/cs/all',
    handler,
};
