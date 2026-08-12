import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/:type',
    categories: ['university'],
    example: '/dlmu/news/hdyw',
    parameters: { type: '默认为 `hdyw`' },
    name: '新闻网',
    maintainers: ['arjenzhou'],
    handler,
    description: `| 海大要闻 | 媒体海大 | 综合新闻 | 院系风采 | 海大校报 | 理论园地 | 海大讲坛 | 艺文荟萃 |
| :------: | :------: | :------: | :------: | :------: | :------: | :------: | :------: |
|   hdyw   |   mthd   |   zhxw   |   yxfc   |   hdxb   |   llyd   |   hdjt   |   ywhc   |`,
};

const baseUrl = 'https://news.dlmu.edu.cn';

const map = {
    hdyw: '/hdyw.htm',
    mthd: '/mthd.htm',
    zhxw: '/zhxw.htm',
    yxfc: '/yxfc.htm',
    hdxb: '/hdxb.htm',
    llyd: '/llyd.htm',
    hdjt: '/hdjt.htm',
    ywhc: '/ywhc.htm',
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const link = Object.hasOwn(map, type) ? `${baseUrl}${map[type]}` : `${baseUrl}/hdyw.htm`;
    const response = await ofetch(link);

    const $ = load(response);

    return {
        link: baseUrl,
        title: '大连海事大学新闻',
        item: $('.n-Box .n-right .n-pic-box .n-news dl')
            .slice(0, 10)
            .toArray()
            .map((element) => ({
                link: new URL($('dd a', element).attr('href')!, baseUrl).href,
                title: $('dd a', element).text(),
                description: $('dd p', element).text(),
                pubDate: timezone(parseDate($('i', element).text().slice(1, -1)), 8),
            })),
    };
}
