import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/research/:variety?/:type?',
    categories: ['finance'],
    example: '/wkjyqh/research',
    radar: [
        {
            source: ['www.wkjyqh.com/main/research_center/yjbg/index.shtml', 'www.wkjyqh.com/main/research_center/'],
        },
    ],
    name: '研究报告',
    parameters: { variety: '官网交易品种编码，0 或省略为全部；宏观金融为 1、农产品为 5、贵金属为 7。', type: '官网报告类型编码，0 或省略为全部，2 为周报。' },
    description: '例如农产品周报使用 `/wkjyqh/research/5/2`，全部品种周报使用 `/wkjyqh/research/0/2`。参数对应官网原生研究报告栏目，不请求后续页面。',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.wkjyqh.com/main/research_center/yjbg/index.shtml',
};

async function handler(ctx) {
    const variety = ctx.req.param('variety');
    const type = ctx.req.param('type');
    if ((variety && !/^[0-7]$/.test(variety)) || (type && !/^[0-5]$/.test(type))) {
        throw new InvalidParameterError('Use native variety codes 0–7 and report type codes 0–5; 0 means all.');
    }
    const baseUrl = 'https://www.wkjyqh.com';
    const link = `${baseUrl}/main/research_center/yjbg/index.shtml`;

    const apiResponse =
        variety || type
            ? await ofetch(`${baseUrl}/servlet/json`, {
                  query: { catalog_id: '232', curtpage: '1', numperpage: '20', variety_type: variety === '0' ? '' : (variety ?? ''), ann_type: type === '0' ? '' : (type ?? ''), query_type: '1', funcNo: '2000302' },
                  responseType: 'json',
                  allowH2: false,
              })
            : await ofetch(`${baseUrl}/servlet/json`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: new URLSearchParams({
                      funcNo: '2000153',
                      catalogId: '232',
                      pageNow: '1',
                      pageSize: '15',
                      isFilter: '1',
                      titleLength: '35',
                      briefLength: '70',
                      _catalogId: '',
                      rightId: '',
                  }),
                  responseType: 'json',
              });

    const limit = Number(ctx.req.query('limit')) || apiResponse.results[0].data.length;
    const list: DataItem[] = apiResponse.results[0].data.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(item.url, baseUrl).href,
        pubDate: timezone(parseDate(item.publish_date || item.create_date), 8),
    }));

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!, { allowH2: false });
                const $ = load(response);

                const content = $('.article_detail');
                item.pubDate = timezone(parseDate(content.find('b#time').text()), 8);
                content.find('h2, .tips').remove();
                item.description = content.html()?.trim();

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: '五矿期货 - 研究报告',
        link,
        language: 'zh-CN' as const,
        image: `${baseUrl}/favicon.ico`,
        item: items,
    };
}
