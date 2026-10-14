import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

async function getOptionalPublicationDate(link: string): Promise<Date | undefined> {
    try {
        return await getPublicationDate(link);
    } catch {
        // The original route retains listing metadata if the dedicated date lookup fails.
        return;
    }
}

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
    description: `| all  | tzgg     | ksap     | wjgg     | tmgz     | djks     | xjgl     | bysj     | syjx     |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 全部 | 通知公告 | 考试安排 | 违纪公告 | 推免工作 | 等级考试 | 学籍管理 | 毕业设计 | 实验教学 |

| sjcx     | xkjs     | yjszj      | jxgg     | zyjs     | kcjs     | jcjs     | jxcg     | xsbg     |
| -------- | -------- | ---------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 实践创新 | 学科竞赛 | 研究生助教 | 教学改革 | 专业建设 | 课程建设 | 教材建设 | 教学成果 | 学术报告 |`,
    handler,
};

const getPublicationDate = (link: string) =>
    cache.tryGet(`jiangnan:publication:${link}`, async () => {
        const html = await ofetch(link);
        const $ = load(html);
        const date = $('form[name="_newscontent_fromname"] .zw-other')
            .text()
            .match(/时间[：:]\s*(\d{4}-\d{2}-\d{2})/)?.[1];
        return date ? parseDate(`${date}T00:00:00+08:00`) : undefined;
    });

async function handler(ctx: Context) {
    const { type = 'all' } = ctx.req.param();
    if (!Object.hasOwn(map, type)) {
        throw new InvalidParameterError(`Unknown notice category: ${type}. Choose ${Object.keys(map).join(', ')}.`);
    }
    const link = `${baseUrl}${map[type]}`;

    const response = await ofetch(link, {
        headers: {
            Referer: link,
        },
    });

    const $ = load(response);

    const items = $('.pg-list>ul>li')
        .slice(0, 10)
        .toArray()
        .map((elem): DataItem | null => {
            const title = $('a', elem).attr('title');
            if (!title) {
                return null;
            }
            return {
                link: new URL($('a', elem).attr('href')!, link).href,
                title,
            };
        })
        .filter((item) => item !== null);

    const datedItems = await pMap(
        items,
        async (item) => ({
            ...item,
            // An unavailable full date must not turn a month/day into a guessed year.
            pubDate: await getOptionalPublicationDate(item.link!),
        }),
        { concurrency: 3 }
    );

    return {
        link,
        title: $('title').text(),
        item: datedItems,
    };
}
