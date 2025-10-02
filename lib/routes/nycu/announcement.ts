import { Data, DataItem, Route } from '@/types';
import timezone from '@/utils/timezone';
import { CheerioAPI, load } from 'cheerio';
import { Context } from 'hono';
import ofetch from '@/utils/ofetch';

async function handler(ctx: Context): Promise<Data> {
    const type = ctx.req.param('type') ?? '5';
    const url = `https://infonews.nycu.edu.tw/index.php?SuperType=${type}&action=more&pagekey=1&categoryid=all`;

    const typeName =
        {
            5: '行政公告',
            6: '演講課程',
            7: '藝文體育',
            9: '校園徵才',
            8: '其他活動',
            3: '電子公文',
            10: '校外訊息',
        }[type] || '未知分類';

    const $ = await ofetch<CheerioAPI>(url, {
        parseResponse: load,
    });

    const rows = $('.category-style tr').toArray().slice(1);
    const item: DataItem[] = [];

    for (let i = 0; i < rows.length; i += 3) {
        const titleElem = $('a', rows[i]);
        const dateElem = $('td', rows[i + 1]);

        const date = dateElem.text().split('-')[0]?.trim();

        item.push({
            title: titleElem.attr('title')?.trim() || '',
            link: titleElem.attr('href') || '',
            pubDate: date ? timezone(date, 8) : undefined,
        });
    }

    return {
        title: `陽明交大交大校園公告 - ${typeName}`,
        description: `國立陽明交通大學校園公告 - ${typeName}`,
        language: 'zh-TW',
        link: url,
        item,
    };
}

export const route: Route = {
    name: '校園公告',
    categories: ['university'],
    maintainers: ['simbafs'],
    description: `|   名稱   | :type |
| :------: | :---: |
| 行政公告 |   5   |
| 演講課程 |   6   |
| 藝文體育 |   7   |
| 校園徵才 |   9   |
| 其他活動 |   8   |
| 電子公文 |   3   |
| 校外訊息 |  10   |`,
    path: '/announcement/:type',
    parameters: { type: '類型，見下表' },
    example: '/announcement/5',
    handler,
};
