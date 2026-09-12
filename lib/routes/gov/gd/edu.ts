import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/edu/:caty',
    categories: ['government'],
    example: '/gov/gd/edu/gdjyxw',
    parameters: {
        caty: '资讯类别',
    },
    name: '省教育厅',
    maintainers: ['nczitzk'],
    handler,
    description: `| 时政要闻 | 广东教育新闻 | 图片新闻 | 战线联播 | 公示公告 | 教育政策法规 | 政策解读 |
| :------: | :----------: | :------: | :------: | :------: | :----------: | :------: |
|   szyw   |    gdjyxw    |   tpxw   |   zxlb   |   gsgg   |    jyzcfg    |   zcjd   |`,
};

const rootUrl = 'https://edu.gd.gov.cn/';

const config = {
    szyw: {
        link: '/jyzxnew/szyw/index.html',
        title: '时政要闻',
    },
    gdjyxw: {
        link: '/jyzxnew/gdjyxw/index.html',
        title: '广东教育新闻',
    },
    tpxw: {
        link: '/jyzxnew/tpxw/index.html',
        title: '图片新闻',
    },
    zxlb: {
        link: '/jyzxnew/zxlb/index.html',
        title: '战线联播',
    },
    gsgg: {
        link: '/zwgknew/gsgg/index.html',
        title: '公示公告',
    },
    jyzcfg: {
        link: '/zwgknew/jyzcfg/index.html',
        title: '教育政策法规',
    },
    zcjd: {
        link: '/zwgknew/zcjd/index.html',
        title: '政策解读',
    },
};

async function handler(ctx: Context) {
    const { caty } = ctx.req.param();
    const cfg = config[caty];
    if (!cfg) {
        throw new InvalidParameterError('Bad category. See docs');
    }

    const currentUrl = new URL(cfg.link, rootUrl).href;
    const response = await ofetch(currentUrl);

    const $ = load(response);
    const list = $('div.newsList ul.list li')
        .toArray()
        .map((item): DataItem => {
            const a = $(item).find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: timezone(parseDate($(item).find('span.time').text()), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                if (!new URL(item.link!).hostname.endsWith('.gd.gov.cn')) {
                    return item;
                }
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);
                item.description = content('div.article').html();
                item.pubDate = timezone(parseDate(content('div.message span.time').text().replace('时间：', '')), 8);
                return item;
            })
        )
    );

    return {
        title: `广东省教育厅 - ${cfg.title}`,
        link: currentUrl,
        item: items,
    };
}
