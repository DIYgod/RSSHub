import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/eea/:caty',
    categories: ['government'],
    example: '/gov/gd/eea/kszs',
    parameters: {
        caty: '资讯类别',
    },
    name: '省教育考试院',
    maintainers: ['icealtria'],
    handler,
    description: `| 考试招生 | 社会考试 | 招考公示 | 报考指南 | 要闻动态 | 公开专栏 | 政策文件 | 政策解读 |
| :------: | :------: | :------: | :------: | :------: | :------: | :------: | :------: |
|   kszs   |   shks   |   zkgs   |   bkzn   |   ywdt   |   gkzl   |   zcwj   |   zcjd   |`,
};

const rootUrl = 'https://eea.gd.gov.cn/';

const config = {
    kszs: { link: '/bmbk/kszs/', title: '考试招生' },
    shks: { link: '/shks/', title: '社会考试' },
    zkgs: { link: '/zwgk_zkgs/', title: '招考公示' },
    bkzn: { link: '/bmbk/bkzn/', title: '报考指南' },
    ywdt: { link: '/news/', title: '要闻动态' },
    gkzl: { link: '/zwgk/gkzl/', title: '公开专栏' },
    zcwj: { link: '/zwgk/zwwj/', title: '政策文件' },
    zcjd: { link: '/zcjd/', title: '政策解读' },
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
    const list = $('div.main>div.content>ul>li')
        .toArray()
        .map((item): DataItem => {
            const a = $(item).find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                if (item.link!.startsWith('https://mp.weixin.qq.com/')) {
                    return item;
                }
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);
                item.description = content('div.article').html();
                item.pubDate = timezone(parseDate(content('span.time').text()), 8);
                return item;
            })
        )
    );

    return {
        title: `广东省教育考试院 - ${cfg.title}`,
        link: currentUrl,
        item: items,
    };
}
