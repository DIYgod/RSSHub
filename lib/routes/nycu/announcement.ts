import { Data, Route } from '@/types';
import timezone from '@/utils/timezone';
import { CheerioAPI, load } from 'cheerio';
import { Context } from 'hono';
import ofetch from '@/utils/ofetch';

async function handler(ctx: Context): Promise<Data> {
    const type = ctx.req.param('type') ?? '5';
    const url = `https://infonews.nycu.edu.tw/index.php?SuperType=${type}&action=more&pagekey=1&categoryid=all`;

    const $ = await ofetch<CheerioAPI>(url, {
        parseResponse: load,
    });

    const typeName =
        Object.fromEntries(
            $('#masterMenu1 #option li a')
                .toArray()
                .slice(1, -1)
                .map((a) => [new URLSearchParams(($(a).attr('href') || '').replace('index.php', '')).get('SuperType'), $(a).text().replaceAll(/\s+/g, '')])
        )[type] || '未知分類';

    const item = $('.category-style tr .style2')
        .toArray()
        .map((titleEle) => {
            const date = $(titleEle).parent().next().find('td').text().split('-')[0]?.trim();

            return {
                title: $(titleEle).attr('title')?.trim() || '',
                link: $(titleEle).find('a').attr('href') || '',
                pubDate: date ? timezone(date, 8) : undefined,
            };
        });

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
    example: '/nycu/announcement/5',
    handler,
};
