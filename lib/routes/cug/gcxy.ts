import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/gcxy/:type?',
    categories: ['university'],
    example: '/cug/gcxy/xyxw',
    parameters: { type: '分类，见下表，默认为所有' },
    name: '工程学院',
    maintainers: ['Doradx'],
    description: `| 学院新闻 | 通知公告 | 党建新闻 | 学术动态 | 本科生培养 | 研究生教育 |
| -------- | -------- | -------- | -------- | ---------- | ---------- |
| xyxw     | tzgg     | djxw     | xsdt     | bkspy      | yjsjy      |`,
    handler,
};

async function handler(ctx: Context) {
    const host = 'https://gcxy.cug.edu.cn';

    const typeUrl = {
        xyxw: '/index/xyxw.htm',
        tzgg: '/index/tzgg.htm',
        djxw: '/index/djxw.htm',
        xsdt: '/kxyj/xsdt.htm',
        bkspy: '/index/bkspy.htm',
        yjsjy: '/index/yjsjy.htm',
    };

    const type = ctx.req.param('type') as keyof typeof typeUrl | undefined;
    if (type && !Object.hasOwn(typeUrl, type)) {
        throw new Error('Invalid type');
    }

    const selected = type ? [typeUrl[type]] : Object.values(typeUrl);

    const getItems = async (url: string) => {
        const response = await ofetch(host + url);
        const $ = load(response);
        const name = $('a.selected').text();
        const items = await Promise.all(
            $('ul.col-news-list li.list_item')
                .toArray()
                .map((item) => {
                    const $item = $(item);
                    const a = $item.find('a.news-title');
                    const linkUrl = new URL(a.attr('href')!, host + url);
                    const link = linkUrl.href;
                    return cache.tryGet(link, async () => {
                        const entry: DataItem = {
                            title: a.attr('title')!,
                            link,
                            pubDate: timezone(parseDate($item.find('span.news-date').text()), 8),
                        };
                        if (linkUrl.hostname !== 'gcxy.cug.edu.cn') {
                            return entry;
                        }
                        const res = await ofetch(link);
                        entry.description = load(res)('.v_news_content').html();
                        return entry;
                    }) as Promise<DataItem>;
                })
        );
        return { name, items };
    };

    const outList = await Promise.all(selected.map((url) => getItems(url)));
    const name = type ? outList[0].name : '所有';

    return {
        title: `[${name}]CUG-工程学院`,
        link: host + (type ? typeUrl[type] : ''),
        description: '中国地质大学(武汉)工程学院-' + name,
        item: outList.flatMap((o) => o.items),
    };
}
