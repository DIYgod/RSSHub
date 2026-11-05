import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:category?',
    categories: ['study'],
    example: '/fjksbm/news',
    parameters: { category: '分类，见下表，默认为 0（已发布公告，方案即将开始）' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['fjksbm.com/portal/:category?', 'fjksbm.com/portal'],
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    description: `| 已发布公告 (方案)，即将开始 | 网络报名进行中 | 网络报名结束等待打印准考证 | 正在打印准考证 | 考试结束，等待发布成绩 | 已发布成绩 | 新闻动态 | 政策法规 |
| --------------------------- | -------------- | -------------------------- | -------------- | ---------------------- | ---------- | -------- | -------- |
| 0                           | 1              | 2                          | 3              | 4                      | 5          | news     | policy   |`,
};

const categoryNames = ['已发布公告(方案)，即将开始', '网络报名进行中', '网络报名结束等待打印准考证', '正在打印准考证', '考试结束，等待发布成绩', '已发布成绩'];

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '0';
    const id = Number.parseInt(category);
    const isNumber = !Number.isNaN(id);
    const rootUrl = 'https://fjksbm.com';
    const currentUrl = `${rootUrl}/portal${isNumber ? '' : `/${category}`}`;
    const response = await got(currentUrl);
    const $ = load(response.data);
    const heading = isNumber ? categoryNames[id] : category === 'news' ? '新闻动态' : '政策法规';
    const $panel = $('.panel')
        .filter((_, el) => $(el).children('.panel-heading').text().replaceAll(/\s/g, '') === heading?.replaceAll(/\s/g, ''))
        .first();
    const list: DataItem[] = isNumber
        ? $panel
              .find('table tr:first-child > td > a')
              .toArray()
              .map((el) => ({
                  title: $(el).text(),
                  link: new URL(`${$(el).attr('href')!.replace(/\/$/, '')}/news/bulletin`, rootUrl).href,
              }))
        : $panel
              .find('ul li')
              .toArray()
              .map((el) => {
                  const $item = $(el);
                  const $title = $item.find('a').first();
                  const date = $item
                      .find('small')
                      .text()
                      .match(/\d{4}-\d{2}-\d{2}/)?.[0];
                  return {
                      title: $title.attr('title') || $title.text(),
                      link: new URL($title.attr('href')!, rootUrl).href,
                      pubDate: date ? parseDate(`${date}T00:00:00Z`) : undefined,
                  };
              });

    const items = isNumber
        ? await Promise.all(
              list.map((item) =>
                  cache.tryGet(item.link!, async () => {
                      const detailResponse = await got(item.link);
                      const content = load(detailResponse.data);
                      const $body = content('.panel-body')
                          .filter((_, el) => content(el).children('h3').length > 0)
                          .first();
                      const date = $body.text().match(/发布时间：(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/)?.[1];
                      $body.children('h3').remove();
                      $body.children('div').first().remove();
                      return {
                          ...item,
                          description: $body.html(),
                          pubDate: date ? timezone(parseDate(date), 8) : undefined,
                      };
                  })
              )
          )
        : list;

    return {
        title: `${heading} - 福建考试报名网`,
        link: currentUrl,
        item: items,
    };
}
