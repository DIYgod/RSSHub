import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:keyword?',
    categories: ['new-media'],
    example: '/topys',
    parameters: { keyword: '关键字，可在对应结果页的 URL 中找到' },
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
            source: ['topys.cn/search/:keyword', 'topys.cn/'],
        },
    ],
    name: '关键字',
    maintainers: ['nczitzk'],
    handler,
    description: `| 创意 | 设计 | 商业 | 艺术 | 文化 | 科技 |
| ---- | ---- | ---- | ---- | ---- | ---- |`,
};

function parsePubDate(value?: number) {
    return typeof value === 'number' && Number.isFinite(value) ? parseDate(value * 1000) : undefined;
}

async function handler(ctx) {
    const keyword = ctx.req.param('keyword') ?? '';
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 16;

    const rootUrl = 'https://www.topys.cn';
    const currentUrl = `${rootUrl}${keyword ? `/search/${keyword}` : '/api/web/article/get_article_list'}`;

    const response = keyword
        ? await got({
              method: 'get',
              url: currentUrl,
          })
        : await got({
              method: 'post',
              url: currentUrl,
              json: {
                  istop_time: 0,
                  size: limit,
              },
          });

    let items: DataItem[] = keyword
        ? response.data.match(/id:(\d+),title:"(.*?)",keyword:"(.*?)",istop_time:(\d+),thumb/g).map((item) => {
              const matches = item.match(/id:(\d+),title:"(.*)",keyword:"(.*)",istop_time:(\d+),thumb/);
              return {
                  title: matches[2],
                  category: matches[3].split(','),
                  link: `${rootUrl}/article/${matches[1]}`,
                  pubDate: parsePubDate(Number(matches[4])),
              };
          })
        : response.data.data.map((item) => ({
              title: item.title,
              author: item.editor,
              category: item.keyword.split(','),
              link: `${rootUrl}/article/${item.id}`,
              pubDate: parsePubDate(item.istop_time),
          }));

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`topys:detail:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                return {
                    description: content('.article-content').html(),
                    author: content('.author-name p').first().text(),
                };
            });

            return {
                ...item,
                description: detail.description,
                author: item.author ?? detail.author,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: `${keyword ? `${keyword} - ` : ''}TOPYS`,
        link: keyword ? currentUrl : `${rootUrl}/pick`,
        item: items,
    };
}
