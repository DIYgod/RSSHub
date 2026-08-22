import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/kmust/jwc/notify',
    parameters: { type: '默认为 `notify`' },
    name: '教务处',
    maintainers: ['geekrainy'],
    description: `| 教务通知 | 教务新闻 |
| -------- | -------- |
| notify   | news     |`,
    handler,
};

const baseUrl = 'https://jwc.kmust.edu.cn';
const typeProps = {
    notify: {
        url: '/jwtz/jwtz.htm',
        title: '教务通知',
    },
    news: {
        url: '/jwxw/jwxw.htm',
        title: '教务新闻',
    },
};

async function handler(ctx: Context): Promise<Data> {
    const { type = 'notify' } = ctx.req.param();
    const pageUrl = new URL(typeProps[type].url, baseUrl).href;
    const title = `${typeProps[type].title}-昆明理工大学`;
    const response = await ofetch(pageUrl);

    const $ = load(response);

    const list = $('table.normalfont tr a[target="_blank"]')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            return {
                link: new URL($item.attr('href')!, pageUrl).href,
                title: $item.text().trim(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.pubDate = timezone(parseDate($('.gray').text().replace('发布时间：', ''), 'YYYY-MM-DD'), 8);
                item.description = $('.v_news_content').html();
                return item;
            })
        )
    );

    return {
        link: pageUrl,
        title,
        item: items as DataItem[],
    };
}
