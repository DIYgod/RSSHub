import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/qa/:category?/:state?',
    categories: ['programming'],
    example: '/quicker/qa',
    parameters: { category: '分类，见下表，默认为全部', state: '状态，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '讨论区',
    maintainers: ['Cesaryuan', 'nczitzk'],
    handler,
    description: `分类

  | 使用问题 | 动作开发 | BUG 反馈 | 功能建议 |
  | -------- | -------- | -------- | -------- |
  | 1        | 9        | 3        | 4        |

  | 动作需求 | 经验创意 | 动作推荐 | 信息发布 |
  | -------- | -------- | -------- | -------- |
  | 6        | 2        | 7        | 5        |

  | 随便聊聊 | 异常报告 | 全部 |
  | -------- | -------- | ---- |
  | 8        | 10       | all  |

  状态

  | 全部 | 精华   | 已归档  |
  | ---- | ------ | ------- |
  |      | digest | achived |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'all';
    const state = ctx.req.param('state') ?? '';

    const rootUrl = 'https://getquicker.net';
    const currentUrl = `${rootUrl}/QA${category === 'all' ? '' : `?category=${category}`}${state ? `?state=${state}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('a.question-title')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('div[data-note="最后更新人信息"]').remove();

                const pubDate = content('.info-text')
                    .first()
                    .text()
                    .replace(/创建于 /, '')
                    .trim();

                item.description = content('.topic-body').html();
                item.author = content('.user-link').first().text();
                item.pubDate = timezone(/-/.test(pubDate) ? parseDate(pubDate) : parseRelativeDate(pubDate), +8);

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
}
