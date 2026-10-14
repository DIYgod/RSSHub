import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const config = {
    review: {
        title: '评论 & 研究',
        query: '.module-news-main',
    },
    story: {
        title: '要闻',
        query: '.img-List',
    },
    fengwen: {
        title: '风闻',
        query: '.fengwen-list',
    },
    redian: {
        title: '热点',
    },
    gundong: {
        title: '滚动',
    },
    all: {
        title: '全部',
    },
    home: {
        title: '首页',
    },
    others: {
        title: '热点 & 滚动',
    },
};

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/guancha',
    parameters: { category: '分类，见下表，默认为全部' },
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
            source: ['guancha.cn/'],
        },
    ],
    name: '首页',
    maintainers: ['nczitzk', 'Jeason0228'],
    handler,
    url: 'guancha.cn/',
    description: `| 全部 | 评论 & 研究 | 要闻  | 风闻    | 热点新闻 | 滚动新闻 |
| ---- | ----------- | ----- | ------- | -------- | -------- |
| all  | review      | story | fengwen | redian   | gundong  |

home = 评论 & 研究 + 要闻 + 风闻

others = 热点新闻 + 滚动新闻

::: tip
观察者网首页左中右的三个 column 分别对应 **评论 & 研究**、**要闻**、**风闻** 三个部分。
:::`,
};

async function handler(ctx) {
    const total = 10;
    const category = ctx.req.param('category') ?? 'all';
    if (!Object.hasOwn(config, category)) {
        throw new InvalidParameterError('Invalid category. Use all, review, story, fengwen, redian, gundong, home, or others.');
    }
    const rootUrl = 'https://www.guancha.cn';

    type ListItem = DataItem & { link: string };

    let newsList: ListItem[] = [],
        redianList: ListItem[] = [],
        gundongList: ListItem[] = [];

    // 'review', 'story' and 'fengwen' come from homepage.

    if (['review', 'story', 'fengwen', 'all', 'home'].includes(category)) {
        const response = await got({
            method: 'get',
            url: rootUrl,
        });

        const $ = load(response.data);

        const fetchPost = (slice) =>
            slice
                .find('h4.module-title a')
                .toArray()

                // Filter some blank links which lead to no contents but 'https://user.guancha.cn'.

                .filter((item) => $(item).attr('href') !== 'https://user.guancha.cn')
                .map((item) => {
                    const $item = $(item);

                    const link = $item.attr('href');

                    return {
                        title: $item.text(),
                        link: new URL(link!, rootUrl).href,
                    };
                });

        newsList =
            category === 'all' || category === 'home'
                ? [...fetchPost($(config.review.query)).slice(0, total / 3), ...fetchPost($(config.story.query)).slice(0, total / 3), ...fetchPost($(config.fengwen.query)).slice(0, total / 3)]
                : fetchPost($(config[category].query)).slice(0, total);
    }

    // 'redian' and 'gundong' come from api.

    if (['redian', 'all', 'others'].includes(category)) {
        const response = await got({
            method: 'get',
            url: `${rootUrl}/api/redian.htm`,
        });

        redianList = response.data.items
            .map((item) => ({
                title: item.title,
                link: new URL(item.httpUrl, rootUrl).href,
            }))
            .slice(0, category === 'all' ? total / 3 : total);
    }

    if (['gundong', 'all', 'others'].includes(category)) {
        const response = await got(`${rootUrl}/mainnews-gd/`);
        const $ = load(response.data);
        gundongList = $('h4.module-title a')
            .toArray()
            .map((element) => ({
                title: $(element).text(),
                link: new URL($(element).attr('href')!, rootUrl).href,
            }))
            .slice(0, category === 'all' ? total / 3 : total);
    }

    const list = [...newsList, ...redianList, ...gundongList].filter((item, index, items) => items.findIndex((first) => first.link === item.link) === index);
    const items = await Promise.all(
        list.map(async (item) => {
            const article = await cache.tryGet(`guancha:home:article:${item.link}`, async () => {
                let detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                // Some links to posts in 'fengwen' must be redirected in order to fetch content.
                // eg. https://www.guancha.cn/politics/2020_10_23_569021.shtml
                //  => https://user.guancha.cn/main/content?id=399176

                const jumpMatch = detailResponse.data.match(/user.guancha.cn\/main\/content\?id=(.*)";/);

                if (jumpMatch !== null) {
                    const link = `https://user.guancha.cn/main/content?id=${jumpMatch[1]}&page=0`;
                    detailResponse = await got({
                        method: 'get',
                        url: link,
                    });
                }

                const content = load(detailResponse.data);

                const dateMatch = detailResponse.data.match(/"pubDate"\s*:\s*"([^"]+)"/);
                const relativeTime = content('.time1').text();
                const pubDate =
                    dateMatch === null
                        ? relativeTime
                            ? parseRelativeDate(relativeTime) // PubDates of posts in 'fengwen' are in an informal format.
                            : undefined
                        : timezone(parseDate(dateMatch[1]), 8);

                const description = content('.all-txt').html() || content('.article-txt-content').html();
                const author = content('.author-intro p a').text() || content('.article-content div div h4 a').text() || content('.editor-intro p a').text() || content('.left-main > div.time.fix > span').eq(2).text();
                return { description, pubDate, author, link: jumpMatch ? `https://user.guancha.cn/main/content?id=${jumpMatch[1]}&page=0` : item.link };
            });
            return { ...item, ...article };
        })
    );

    return {
        title: `观察者网 - ${config[category].title}`,
        link: rootUrl,
        item: items,
    };
}
