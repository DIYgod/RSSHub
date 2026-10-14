import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.dayanzai.me/';
const sourceHostname = new URL(rootUrl).hostname.replace(/^www\./, '');

const fetchArticleBody = (link: string) =>
    cache.tryGet(`dayanzai:article:${link}`, async () => {
        const detailResponse = await got.get(link);
        const content = load(detailResponse.data);
        return content('div.intro-box').html();
    });

export const route: Route = {
    path: '/:category/:fulltext?',
    categories: ['blog'],
    example: '/dayanzai/windows',
    parameters: { category: '分类', fulltext: '是否获取全文，需要获取则传入参数`y`' },
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
            source: ['dayanzai.me/windows', 'dayanzai.me/windows/*'],
            target: '/windows',
        },
        {
            source: ['dayanzai.me/android', 'dayanzai.me/android/*'],
            target: '/android',
        },
        {
            source: ['dayanzai.me/tutorial', 'dayanzai.me/tutorial/*'],
            target: '/tutorial',
        },
        {
            source: ['dayanzai.me/other', 'dayanzai.me/other/*'],
            target: '/other',
        },
    ],
    name: '分类',
    maintainers: ['gl0zzy'],
    handler,
    description: `| 微软应用 | 安卓应用 | 教程资源 | 其他资源 |
| -------- | -------- | -------- | -------- |
| windows  | android  | tutorial | other    |`,
};

async function handler(ctx) {
    const { category, fulltext } = ctx.req.param();
    const currentUrl = rootUrl + category;
    const response = await got.get(currentUrl);
    const $ = load(response.data);
    const lists = $('div.c-box > div > div.c-zx-list > ul > li');
    const reg = /日期：(.*?(?:\s\(.*?\))?)\s/;
    const relativeDates = new Map<string, Date>();
    const list = lists.toArray().map((item) => {
        const $item = $(item).find('div');
        let date: string | Date = reg.exec($item.find('div.r > p.other').text())![1];
        if (date.includes('周') || date.includes('月')) {
            date = /\((.*?)\)/.exec(date)![1];
            date = timezone(parseDate(date, 'MM-DD'), 8);
        } else if (date.includes('年')) {
            date = /\((.*?)\)/.exec(date)![1];
            date = timezone(parseDate(date, 'YYYY-MM-DD'), 8);
        } else {
            const relativeDate = relativeDates.get(date) ?? parseRelativeDate(date);
            relativeDates.set(date, relativeDate);
            date = relativeDate;
        }
        return {
            title: $item.find('div.r > p.r-top > span > a').text(),
            author: /作者：(.*?)\s日期：/.exec($item.find('div.r > p.other').text())?.[1],
            pubDate: date,
            description: $item.find('div.r > p.desc').text(),
            link: $item.find('div.r > p.r-top > span > a').attr('href'),
            category: $item
                .find('a[rel="tag"]')
                .toArray()
                .map((tag) => $(tag).text()),
        };
    });
    const items =
        fulltext === 'y'
            ? await pMap(
                  list,
                  async (item) => {
                      if (new URL(item.link!, rootUrl).hostname.replace(/^www\./, '') !== sourceHostname) {
                          return item;
                      }
                      const description = await fetchArticleBody(item.link!);
                      return { ...item, description: description ?? item.description };
                  },
                  { concurrency: 3 }
              )
            : list;

    return {
        title: `大眼仔旭 ${category}`,
        link: currentUrl,
        description: `大眼仔旭 ${category} RSS`,
        item: items,
    };
}
