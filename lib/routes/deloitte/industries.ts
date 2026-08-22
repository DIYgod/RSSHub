import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/industries/:category?',
    categories: ['journal'],
    example: '/deloitte/industries/consumer',
    parameters: { category: '默认为 energy' },
    name: 'Articles',
    maintainers: ['laampui'],
    description: `| 消费行业 | 能源、资源及工业行业 | 金融服务行业       | 政府及公共服务    | 生命科学与医疗            | 科技、传媒及电信行业 |
| -------- | -------------------- | ------------------ | ----------------- | ------------------------- | -------------------- |
| consumer | energy               | financial-services | government-public | life-sciences-health-care | tmt                  |`,
    handler,
};

async function handler(ctx: Context) {
    const { category = 'energy' } = ctx.req.param();
    const rootUrl = 'https://www.deloitte.com';
    const currentUrl = `${rootUrl}/cn/zh/Industries/${category}/about.html`;
    const response = await ofetch(currentUrl);
    const $ = load(response);
    const cells = $('.cmp-mosaic-grid__cell');
    const articles: DataItem[] = cells.length
        ? cells.toArray().map((ele) => {
              const $ele = $(ele);
              return {
                  title: $ele.find('.cmp-mosaic-grid__title h4').text(),
                  link: new URL($ele.find('a').attr('href')!, rootUrl).href,
              };
          })
        : $('.cmp-promo-container__content a.cmp-promo-tracking')
              .toArray()
              .map((ele) => {
                  const $ele = $(ele);
                  return {
                      title: $ele.find('.cmp-promo__content__title').text().trim(),
                      link: new URL($ele.attr('href')!, rootUrl).href,
                  };
              });

    const item = await Promise.all(
        articles.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const s = load(detailResponse);

                item.description = s('.cmp-text').html();

                return item;
            })
        )
    );

    return {
        title: `Deloitte - ${$('title').text().split('|', 1)[0].trim()}`,
        link: currentUrl,
        item,
    };
}
