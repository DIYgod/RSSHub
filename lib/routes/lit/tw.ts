import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/tw/:name?',
    categories: ['university'],
    example: '/lit/tw',
    parameters: { name: '默认为 `all`' },
    name: '团委',
    maintainers: ['vhxubo'],
    description: `| 全部 | 新闻动态 | 公示公告 |
| ---- | -------- | -------- |
| all  | xwdt     | gsgg     |`,
    handler,
};

const baseUrl = 'https://www.lit.edu.cn/tw/';
const nameProps = {
    xwdt: '新闻动态',
    gsgg: '公示公告',
};

async function handler(ctx: Context): Promise<Data> {
    const { name = 'all' } = ctx.req.param();
    const urla = new URL(name === 'all' ? 'xb2024.htm' : `xb2024/syxw/${name}.htm`, baseUrl).href;
    const response = await ofetch(urla);
    const $ = load(response);

    const list = $(name === 'all' ? '.newslayout li, .announlist1 li' : '.newslist li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, urla).href,
                pubDate: timezone(parseDate($item.find('i, span').text() || `${$item.find('.rq p').text()}-${$item.find('.rq h2').text()}`), 8),
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            item.link!.includes('xb2024info.jsp')
                ? item
                : cache.tryGet(item.link!, async () => {
                      const result = await ofetch(item.link!);
                      const $ = load(result);

                      $(
                          'img[src="/system/resource/images/fileTypeImages/icon_xls.gif"], img[src="/system/resource/images/fileTypeImages/icon_doc.gif"], img[src="/system/resource/images/fileTypeImages/icon_ppt.gif"], img[src="/system/resource/images/fileTypeImages/icon_pdf.gif"]'
                      ).remove();

                      item.title = $('.article-title').text() || item.title;
                      item.description = $('.v_news_content').html();

                      return item;
                  })
        )
    );

    return {
        title: name === 'all' ? '团委 - 洛阳理工学院' : `${nameProps[name]} - 洛理团委`,
        link: urla,
        description: '洛阳理工学院团委 RSS',
        item: items as DataItem[],
    };
}
