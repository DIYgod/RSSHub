import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/sbjm/:category?',
    categories: ['government'],
    example: '/gov/mohrss/sbjm',
    parameters: { category: '分类，见下表' },
    name: '社保减免',
    maintainers: ['nczitzk'],
    description: `| 要点新闻 | 政策文件 | 工作动态 | 媒体报道 | 图片新闻 |
| -------- | -------- | -------- | -------- | -------- |
| ydxw     | zcwj     | gzdt     | mtbd     | tpxw     |`,
    handler,
};

const rootUrl = 'https://www.mohrss.gov.cn';
const challengePattern = /(?:WTKkN|bOYDu|wyeCN)['"]?:\s*\d+/g;

async function fetchWithAntiBot(url: string, cookie = '') {
    const response = await ofetch(url, { headers: { cookie } });
    const matches = response.match?.(challengePattern);
    if (matches && !cookie) {
        const status = matches.slice(0, 3).reduce((sum, str) => sum + Number(/\d+/.exec(str)![0]), 0);
        return fetchWithAntiBot(url, `__tst_status=${status}#;`);
    }
    return response;
}

async function handler(ctx: Context) {
    const { category = 'ydxw' } = ctx.req.param();

    const currentUrl = `${rootUrl}/SYrlzyhshbzb/rdzt/jfjf/${category}/`;
    const response = await fetchWithAntiBot(currentUrl);
    const $ = load(response);

    const list = $("div[class^='rsb_jfjf_cont'] ul li")
        .slice(0, 15)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text().trim(),
                link: new URL(a.attr('href')!, currentUrl).href.replace(/^http:(?=\/\/www\.mohrss\.gov\.cn\/)/, 'https:'),
                pubDate: timezone(parseDate($item.find('span').text()), 8),
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            item.link!.startsWith(`${rootUrl}/`)
                ? cache.tryGet(item.link!, async () => {
                      const detailResponse = await fetchWithAntiBot(item.link!);
                      const content = load(detailResponse);

                      item.description = content('#insMainConTxt').html() || content('.TRS_Editor').html() || content('.art_p').html();
                      const pubDate = content('meta[name="PubDate"]').attr('content');
                      if (pubDate) {
                          item.pubDate = timezone(parseDate(pubDate), 8);
                      }

                      return item;
                  })
                : item
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
