import { Data, Route } from '@/types';
import timezone from '@/utils/timezone';
import { CheerioAPI, load } from 'cheerio';
import { Context } from 'hono';
import ofetch from '@/utils/ofetch';

function ROCDate(dateStr: string | Date): Date {
    const date = new Date(dateStr);
    date.setFullYear(date.getFullYear() + 1911);

    return timezone(date, 8);
}

async function handler(ctx: Context): Promise<Data> {
    const id = ctx.req.param('id') ?? '2652';
    const url = `https://aa.nycu.edu.tw/aa/ch/app/news/list?module=headnews&id=${id}`;

    const name = {
        '2652': '全部',
        '2462': '註冊組',
        '2502': '課務組',
        '2523': '綜合組',
        '2538': '實習組',
        '2545': '數位教學中心',
        '2565': '教學發展中心',
        '2617': '國際高教培訓暨認證中心',
        '2638': '雙語教育與學習推動辦公室',
    }[id];

    const $ = await ofetch<CheerioAPI>(url, {
        parseResponse: load,
    });

    const item = $('.newslist li')
        .toArray()
        .map((e) => ({
            title: $('a', e).attr('title')?.trim() || '',
            link: $('a', e).attr('href') || '',
            pubDate: ROCDate($('div p:nth-child(1)', e).text().replace('更新日期：', '').trim()),
            category: [$('div p:nth-child(2)', e).text().replace('分類：', '')],
            author: $('div p:nth-child(3)', e).text().replace('發布單位：', ''),
        }));

    return {
        title: `陽明交大教務處公告 - ${name}`,
        description: `國立陽明交大教務處公告 - ${name}`,
        language: 'zh-TW',
        link: url,
        item,
    };
}

export const route: Route = {
    name: '教務處公告',
    categories: ['university'],
    maintainers: ['simbafs'],
    description: `|           名稱           | :id  |
| :----------------------: | :--: |
|           全部           | 2652 |
|          註冊組          | 2462 |
|          課務組          | 2502 |
|          綜合組          | 2523 |
|          實習組          | 2538 |
|       數位教學中心       | 2545 |
|       教學發展中心       | 2565 |
|  國際高教培訓暨認證中心  | 2617 |
| 雙語教育與學習推動辦公室 | 2638 |`,
    path: '/aa/:id?',
    parameters: { id: 'id, see below' },
    example: '/nycu/aa/2652',
    handler,
};
