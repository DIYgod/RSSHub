import { load } from 'cheerio';
import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:id?',
    name: '分类',
    url: 'xd.x6d.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/x6d/34',
    parameters: { id: '分类 id，可在对应分类页面的 URL 中找到，默认为首页最近更新' },
    description: `| 技巧分享 | QQ 技巧 | 微信技巧 | 其他教程 | 其他分享 |
| -------- | ------- | -------- | -------- | -------- |
| 31       | 55      | 112      | 33       | 88       |

| 宅家自学 | 健身养生 | 摄影剪辑 | 长点知识 | 自我提升 | 两性相关 | 编程办公 | 职场关系 | 新媒体运营 | 其他教程 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ---------- | -------- |
| 18       | 98       | 94       | 93       | 99       | 100      | 21       | 22       | 19         | 44       |

| 活动线报 | 流量话费 | 免费会员 | 实物活动 | 游戏活动 | 红包活动 | 空间域名 | 其他活动 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 34       | 35       | 91       | 92       | 39       | 38       | 37       | 36       |

| 值得一看 | 找点乐子 | 热门事件 | 节目推荐 |
| -------- | -------- | -------- | -------- |
| 65       | 50       | 77       | 101      |

| 值得一听 | 每日一听 | 歌单推荐 |
| -------- | -------- | -------- |
| 71       | 87       | 79       |

| 资源宝库 | 书籍资料 | 设计资源 | 剪辑资源 | 办公资源 | 壁纸资源 | 编程资源 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 106      | 107      | 108      | 109      | 110      | 111      | 113      |`,
    categories: ['new-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};
const rootUrl = 'https://xd.x6d.com';
async function fetchDetail(link: string): Promise<Pick<DataItem, 'description' | 'pubDate' | 'category' | 'author' | 'content' | 'image' | 'banner'>> {
    const { data: detailResponse } = await got(link);
    const $ = load(detailResponse);
    const description = $('div.article-content').html();
    const imageSrc = $('div.article-content img').first().attr('src');
    const image = imageSrc ? new URL(imageSrc, rootUrl).href : undefined;
    const rawDate = $('time').text();
    const pubDate = rawDate ? timezone(parseDate(rawDate, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD'], true), 8) : undefined;
    return {
        description,
        pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
        category: $('b.bq-wg')
            .toArray()
            .map((element) => $(element).text()),
        author: $('span.bq-zz').text(),
        content: { html: description, text: $('div.article-content').text() },
        image,
        banner: image,
    };
}
export async function handler(ctx) {
    const { id = 'latest' } = ctx.req.param();
    const requestedLimit = Number(ctx.req.query('limit') ?? '22');
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 22;
    let currentUrl = new URL(id === 'latest' ? '' : `html/${id}.html`, rootUrl).href;
    const { data: firstResponse } = await got(currentUrl);
    let $;
    if (/<meta\s/.test(firstResponse)) {
        $ = load(firstResponse);
    } else {
        const redirectParts = id === 'latest' ? [] : firstResponse.match(/'([\w./=?]+)'/g);
        if (!redirectParts) {
            throw new NotFoundError('Could not resolve the category redirect from the source page');
        }
        currentUrl = new URL(id === 'latest' ? '' : redirectParts.toReversed().join('').replaceAll("'", ''), rootUrl).href;
        const { data: response } = await got(currentUrl);
        $ = load(response);
    }
    $('i.rj').remove();
    const language = 'zh' as const satisfies Language;
    const query = id === 'latest' ? $('#newslist ul').first().find('li').not('li.addd').find('a').slice(0, limit) : $('a.soft-title').slice(0, limit);
    let items: Array<
        DataItem & {
            link: string;
        }
    > = query
        .toArray()
        .filter((item) => $(item).attr('href'))
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.prop('title') ?? $item.text(),
                link: new URL($item.prop('href'), rootUrl).href,
                language,
            };
        });
    items = await pMap(
        items,
        (item) =>
            mapResolvedValue(
                cache.tryGet(`x6d:detail:v4:${item.link}`, () => fetchDetail(item.link)),
                (detail) => ({
                    ...item,
                    description: detail.description,
                    pubDate: detail.pubDate,
                    category: detail.category,
                    author: detail.author,
                    content: detail.content,
                    image: detail.image,
                    banner: detail.banner,
                })
            ),
        { concurrency: 3, stopOnError: false }
    );
    const imageSrc = $('div.header-logo img').attr('src');
    const image = imageSrc ? new URL(imageSrc, rootUrl).href : undefined;
    return {
        title: $('title').text().split(/\s-/, 1)[0],
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        image,
        language,
    };
}
async function mapResolvedValue<T, U>(promise: Promise<T>, mapper: (value: T) => U | Promise<U>): Promise<U> {
    const value = await promise;
    return mapper(value);
}
