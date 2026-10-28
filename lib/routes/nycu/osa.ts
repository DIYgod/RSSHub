import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

function parseRocDate(dateStr: string): Date | undefined {
    const match = dateStr.match(/^(\d{2,4})-(\d{2})-(\d{2})$/);
    if (!match) {
        return;
    }
    const year = Number(match[1]) + (match[1].length < 4 ? 1911 : 0);
    return parseDateInTimezone(`${year}-${match[2]}-${match[3]}`, 8);
}

const data = new Map(
    Object.entries({
        '2660': {
            module: 'nycu0091',
            name: '榮譽榜 - 榮譽事蹟',
        },
        '2844': {
            module: 'nycu0082',
            name: '經濟支持及學生輔導 - 生輔一、二',
        },
        '3440': {
            module: 'nycu0083',
            name: '學生宿舍(陽明校區) - 住宿服務一',
        },
        '3465': {
            module: 'nycu0084',
            name: '學生宿舍(交大校區) - 住宿服務二',
        },
        '3494': {
            module: 'nycu0085',
            name: '課外活動 - 課外活動一、二組',
        },
        '3554': {
            module: 'nycu0086',
            name: '健康照護 - 衛生保健組',
        },
        '3594': {
            module: 'nycu0087',
            name: '職涯發展 - 職涯發展組',
        },
        '3635': {
            module: 'nycu0088',
            name: '服務學習 - 服務學習中心',
        },
        '3669': {
            module: 'nycu0089',
            name: '原民資源 - 原資中心',
        },
        '3681': {
            module: 'nycu0090',
            name: '深耕助學 - 深耕助學',
        },
    })
);

async function handler(ctx: Context): Promise<Data> {
    const id = ctx.req.param('id') ?? '2844';

    const category = data.get(id);
    if (!category) {
        throw new InvalidParameterError('Unknown Student Affairs category; use an id from the route documentation.');
    }
    const { module, name } = category;

    const url = `https://osa.nycu.edu.tw/osa/ch/app/data/list?module=${module}&id=${id}`;

    const $ = await ofetch<CheerioAPI>(url, {
        parseResponse: load,
    });

    const item = $('.newslist li')
        .toArray()
        .map((e) => ({
            title: $('a', e).attr('title') || '',
            link: new URL($('a', e).attr('href') || '', url).href,
            pubDate: parseRocDate($('div p:nth-child(1)', e).text().replace('更新日期：', '').trim()),
            category: [$('div p:nth-child(2)', e).text().replace('分類：', '')],
            author: $('div p:nth-child(3)', e).text().replace('發布單位：', ''),
        }));

    return {
        title: `陽明交大學務處公告 - ${name}`,
        description: `國立陽明交大學務處公告 - ${name}`,
        language: 'zh-TW',
        link: url,
        item,
    };
}

export const route: Route = {
    name: '學務處公告',
    categories: ['university'],
    maintainers: ['simbafs'],
    description: `|         項目        |       組別       |  :id |
| :-----------------: | :--------------: | :--: |
|  經濟支持及學生輔導 |   生輔一、二組   | 2844 |
| 學生宿舍 (陽明校區) |   住宿服務一組   | 3440 |
| 學生宿舍 (交大校區) |   住宿服務二組   | 3465 |
|       課外活動      | 課外活動一、二組 | 3494 |
|       健康照護      |    衛生保健組    | 3554 |
|       職涯發展      |    職涯發展組    | 3594 |
|       服務學習      |   服務學習中心   | 3635 |
|       原民資源      |     原資中心     | 3669 |
|       深耕助學      |     深耕助學     | 3681 |
|        榮譽榜       |     榮譽事蹟     | 2660 |`,
    path: '/osa/:id?',
    parameters: { id: 'id, see below' },
    example: '/nycu/osa/2844',
    handler,
};
