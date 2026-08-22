import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://jwc.jiangnan.edu.cn';

const map = {
    all: '/',
    tzgg: '/jwgl/tzgg.htm',
    ksap: '/jwgl/ksap.htm',
    wjgg: '/jwgl/wjgg.htm',
    tmgz: '/jwgl/tmgz.htm',
    djks: '/jwgl/djks.htm',
    xjgl: '/xjgl1.htm',
    bysj: '/sjjx/bysj.htm',
    syjx: '/sjjx/syjx.htm',
    sjcx: '/sjjx/sjcx.htm',
    xkjs: '/sjjx/xkjs.htm',
    yjszj: '/sjjx/yjszj.htm',
    jxgg: '/jxjs/jxgg.htm',
    zyjs: '/jxjs/zyjs.htm',
    kcjs: '/jxjs/kcjs.htm',
    jcjs: '/jxjs/jcjs.htm',
    jxcg: '/jxjs/jxcg.htm',
    xsbg: '/xsbg.htm',
};

export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/jiangnan/jwc/all',
    parameters: { type: '默认为 `all`' },
    name: '教务处通知',
    maintainers: ['fuzy112'],
    features: { antiCrawler: true },
    description: `| all  | tzgg     | ksap     | wjgg     | tmgz     | djks     | xjgl     | bysj     | syjs     |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 全部 | 通知公告 | 考试安排 | 违纪公告 | 推免工作 | 等级考试 | 学籍管理 | 毕业设计 | 实验教学 |

| sjcx     | xkjs     | yjszj      | jxgg     | zyjs     | kcjs     | jcjs     | jxcg     | xsbg     |
| -------- | -------- | ---------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 实践创新 | 学科竞赛 | 研究生助教 | 教学改革 | 专业建设 | 课程建设 | 教材建设 | 教学成果 | 学术报告 |`,
    handler,
};

async function handler(ctx: Context) {
    const { type = 'all' } = ctx.req.param();
    const link = `${baseUrl}${map[type]}`;
    const date = new Date();

    const response = await ofetch(link, {
        headers: {
            Referer: link,
        },
    });

    const $ = load(response);

    return {
        link,
        title: $('title').text(),
        item: $('.pg-list>ul>li')
            .slice(0, 10)
            .toArray()
            .map((elem) => {
                const foodTime = $('span.food-time', elem).text();
                const pubDate = timezone(parseDate(`${date.getFullYear()}-${foodTime}`), 8);
                return {
                    link: new URL($('a', elem).attr('href')!, link).href,
                    title: $('a', elem).attr('title'),
                    pubDate: pubDate > date ? timezone(parseDate(`${date.getFullYear() - 1}-${foodTime}`), 8) : pubDate,
                };
            }) as DataItem[],
    };
}
