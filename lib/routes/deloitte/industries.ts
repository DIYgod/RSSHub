import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { AnyNode } from 'domhandler';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
    const cells = $('.cmp-mosaic-grid__cell:has(a[href])');
    const articles: DataItem[] = cells.length
        ? cells.toArray().map((ele) => {
              const $ele = $(ele);
              return {
                  title: $ele.find('.cmp-mosaic-grid__title h4').text(),
                  link: new URL($ele.find('a[href]').first().attr('href')!, rootUrl).href,
                  description: $ele.find('.cmp-mosaic-grid__text .cmp-text').html(),
              };
          })
        : $('.cmp-promo-container__content a.cmp-promo-tracking')
              .toArray()
              .map((ele) => {
                  const $ele = $(ele);
                  return {
                      title: $ele.find('.cmp-promo__content__title').text(),
                      link: new URL($ele.attr('href')!, rootUrl).href,
                  };
              });

    const item = await Promise.all(
        articles.map((item) =>
            new URL(item.link!).pathname.endsWith('.pdf')
                ? {
                      ...item,
                      enclosure_url: item.link,
                      enclosure_type: 'application/pdf',
                  }
                : cache.tryGet(item.link!, async () => {
                      const detailResponse = await ofetch(item.link!);
                      const s = load(detailResponse);

                      const content = s('.content-width-700--with-padding:has(.cmp-text), .bodyresponsivegridcontainer .cmp-text').filter((_, element) => !s(element).parents('.content-width-700--with-padding:has(.cmp-text)').length);
                      normalizeImages(s, content);
                      content.find('script, style, h1, .cmp-feedback-banner').remove();
                      item.description = content.length
                          ? content
                                .toArray()
                                .map((element) => s(element).html())
                                .join('')
                          : s('.cmp-text').html();
                      const article = s('script[type="application/ld+json"]')
                          .toArray()
                          .map((script) => JSON.parse(s(script).text()))
                          .find((entry) => entry['@type'] === 'Article');
                      if (article?.datePublished) {
                          const date = article.datePublished;
                          item.pubDate = /^\d{4}年\d{1,2}月\d{1,2}日$/.test(date) ? timezone(parseDate(date, 'YYYY年M月D日'), 8) : parseDate(date);
                      }

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

function normalizeImages($: CheerioAPI, content: Cheerio<AnyNode>) {
    content.find('.s7dm-dynamic-media noscript').each((_, element) => {
        $(element).replaceWith($(element).text());
    });
    content.find('img[src^="data:"][srcset]').each((_, element) => {
        const image = $(element);
        const sources = image
            .attr('srcset')!
            .matchAll(/(https?:\/\/\S+)\s+(\d+)w\s*(?:,|$)/g)
            .toArray();
        sources.sort((a, b) => Number(b[2]) - Number(a[2]));
        if (sources[0]) {
            image.attr('src', sources[0][1]);
        }
    });
}
