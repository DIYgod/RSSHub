import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?/:sort?/:day?',
    categories: ['bbs'],
    example: '/jisilu',
    parameters: { category: '分类，见下表，默认为全部，可在 URL 中找到', sort: '排序，见下表，默认为最新，可在 URL 中找到', day: '几天内，见下表，默认为30天，本参数仅在排序参数设定为 `热门` 后才可生效' },
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
            source: ['jisilu.cn/home/explore', 'jisilu.cn/explore', 'jisilu.cn/'],
        },
    ],
    name: '广场',
    maintainers: ['nczitzk'],
    handler,
    url: 'jisilu.cn/home/explore',
    description: `分类

  | 全部 | 债券 / 可转债 | 基金 | 套利 | 新股 |
  | ---- | ------------- | ---- | ---- | ---- |
  |      | 4             | 7    | 5    | 3    |

  排序

  | 最新 | 热门 | 按发表时间 |
  | ---- | ---- | ---------- |
  |      | hot  | add\_time  |

  几天内

  | 30 天 | 7 天 | 当天 |
  | ----- | ---- | ---- |
  | 30    | 7    | 1    |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';
    const sort = ctx.req.param('sort') ?? '';
    const day = ctx.req.param('day') ?? '';

    const rootUrl = 'https://www.jisilu.cn';
    let currentUrl = '',
        name = '',
        response;

    if (category === 'reply' || category === 'topic') {
        if (sort) {
            currentUrl = `${rootUrl}/people/${sort}`;
            response = await got({
                method: 'get',
                url: currentUrl,
            });
            name = response.data.match(/<title>(.*) 的个人主页 - 集思录<\/title>/)[1];
            response = await got({
                method: 'get',
                url: `${rootUrl}/people/ajax/user_actions/uid-${response.data.match(/var PEOPLE_USER_ID = '(.*)'/)[1]}__actions-${category === 'topic' ? 1 : 2}01__page-0`,
            });
        } else {
            throw new Error('No user.');
        }
    } else {
        currentUrl = `${rootUrl}/home/explore/category-${category}__sort_type-${sort}__day-${day}`;
        response = await got({
            method: 'get',
            url: currentUrl,
        });
    }

    const $ = load(response.data);

    $('.nav').prevAll('.aw-item').remove();

    let items = $('.aw-item')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('h4 a');

            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: timezone(
                    parseDate(
                        item
                            .find('.aw-text-color-999')
                            .text()
                            .match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/)[1]
                    ),
                    +8
                ),
                author: category === 'reply' || category === 'topic' ? name : decodeURI(item.find('.aw-user-name').first().attr('href').split('/people/').pop()),
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

                content('.aw-dynamic-topic-more-operate').remove();

                item.description = content('.aw-question-detail-txt').html() + content('.aw-dynamic-topic-content').html();

                return item;
            })
        )
    );

    return {
        title: `${name ? `${name}的${category === 'topic' ? '主题' : '回复'}` : '广场'} - 集思录`,
        link: currentUrl,
        item: items,
    };
}
