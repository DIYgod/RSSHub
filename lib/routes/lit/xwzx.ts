import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/xwzx/:name?',
    categories: ['university'],
    example: '/lit/xwzx',
    parameters: { name: '默认为 `all`' },
    name: '新闻中心',
    maintainers: ['vhxubo'],
    description: `| 全部 | 公告通知 | 新闻快讯 | 学术信息 | 媒体新闻 |
| ---- | -------- | -------- | -------- | -------- |
| all  | ggtz     | xwkx     | xsxx     | mtxw     |`,
    handler,
};

const host = 'https://www.lit.edu.cn/';
const baseUrl = 'https://www.lit.edu.cn/xwzx/';
const nameProps = {
    ggtz: '公告通知',
    xwkx: '新闻快讯',
    xsxx: '学术信息',
    mtxw: '媒体新闻',
};

async function handler(ctx: Context): Promise<Data> {
    const { name = 'all' } = ctx.req.param();
    const categories = name === 'all' ? Object.keys(nameProps) : [name];

    const lists = await Promise.all(
        categories.map(async (category) => {
            const link = new URL(`${category}.htm`, baseUrl).href;
            const response = await ofetch(link);
            const $ = load(response);

            return $('li.notice-item')
                .toArray()
                .map((item) => {
                    const $item = $(item);
                    const [author, date] = $item.find('.notice-link-time').text().split('，', 2);
                    return {
                        title: $item.find('.notice-link-text').text(),
                        link: new URL($item.find('a.notice-link').attr('href')!, link).href,
                        author: date ? author : undefined,
                        pubDate: timezone(parseDate(date ?? author), 8),
                        category: [nameProps[category]],
                    };
                });
        })
    );

    const list: DataItem[] = lists.flat().toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                if (!item.link!.startsWith(host)) {
                    return item;
                }

                const result = await ofetch(item.link!);
                const $ = load(result);
                const content = $('form[name="_newscontent_fromname"]');

                item.title = content.find('h3').text();
                item.description = content.find('.v_news_content').html();

                const time = content.text().match(/\d{4}年\d{1,2}月\d{1,2}日 \d{1,2}:\d{1,2}/);
                if (time) {
                    item.pubDate = timezone(parseDate(time[0], 'YYYY年M月D日 H:mm'), 8);
                }

                return item;
            })
        )
    );

    return {
        title: name === 'all' ? '新闻中心 - 洛阳理工学院' : `${nameProps[name]} - 洛理新闻中心`,
        link: name === 'all' ? baseUrl : new URL(`${name}.htm`, baseUrl).href,
        description: '洛阳理工学院新闻中心 RSS',
        item: items,
    };
}
