import { type Cheerio, load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const migratedCategories = new Map([
    ['110', 'xwzx1/gg.htm'],
    ['6', 'xwzx1/zhxw.htm'],
    ['8', 'xwzx1/ksdt.htm'],
    ['14', 'xwzx1/mtey.htm'],
    ['57', 'yhgz/hldt.htm'],
    ['51', 'kxyj/kydt.htm'],
    ['45', 'yxjy/jxzc.htm'],
]);
export const route: Route = {
    path: '/2yuan/news/:id?',
    categories: ['university'],
    example: '/xjtu/2yuan/news',
    parameters: { id: '编号，见下表，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '第二附属医院新闻',
    maintainers: ['nczitzk'],
    handler,
    description: `| 分类     | 编号 |
| -------- | ---- |
| 通知公告 | 110  |
| 综合新闻 | 6    |
| 科室动态 | 8    |
| 教学动态 | 45   |
| 科研动态 | 51   |
| 护理动态 | 57   |
| 党群活动 | 63   |
| 外事活动 | 13   |
| 媒体二院 | 14   |
| 理论政策 | 16   |`,
};
async function handler(ctx) {
    const id = ctx.req.param('id') ?? '110';
    const rootUrl = 'http://2yuan.xjtu.edu.cn';
    const migratedPath = migratedCategories.get(id);
    const currentUrl = migratedPath ? new URL(migratedPath, 'http://www.2yuan.xjtu.edu.cn/defsyy/').href : `${rootUrl}/Html/News/Columns/${id}/Index.html`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = load(response.data);
    let items = $(migratedPath ? '.lb-list li a[href], .news-list-lb li a[href]' : '.column_list h2')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const anchor = migratedPath ? $item : $item.find('a');
            return {
                title: anchor.attr('title')!,
                link: new URL(anchor.attr('href')!, currentUrl).href,
                ...(!migratedPath && { pubDate: timezone(parseDate($item.find('.dy_date').text()), 8) }),
            };
        });
    items = await pMap(
        items,
        (item) =>
            mapResolvedValue(
                cache.tryGet(`xjtu:2yuan:content:v3:${item.link}`, async () => {
                    const detail: Pick<DataItem, 'description' | 'pubDate' | 'author'> = {};
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = load(detailResponse.data);
                    if (migratedPath) {
                        const body = content('.v_news_content').first();
                        if (!body.length) {
                            throw new Error(`Article content was not found at ${item.link}`);
                        }
                        const links = new Set(mapElements(body.find('a[href]'), (_, element) => content(element).attr('href')));
                        const attachments = content('.wznr a[href*="download.jsp"]')
                            .filter((_, element) => !content(element).closest('.v_news_content').length)
                            .toArray()
                            .filter((element) => {
                                const href = content(element).attr('href')!;
                                if (links.has(href)) {
                                    return false;
                                }
                                links.add(href);
                                return true;
                            });
                        detail.description = body.html()! + attachments.map((element) => `<p>${content.html(element)}</p>`).join('');
                        const hospitalAuthor = content('.article-sm span')
                            .filter((_, element) => content(element).text().startsWith('作者：'))
                            .text()
                            .replace(/^作者：/, '')
                            .trim();
                        const universityArticle = new URL(item.link!).hostname === 'news.xjtu.edu.cn';
                        const author =
                            hospitalAuthor ||
                            (universityArticle
                                ? content('.zdf .d_write2')
                                      .filter((_, element) => content(element).find('.d_write').text() === '文字：')
                                      .find('.spans')
                                      .text()
                                      .trim()
                                : '');
                        if (author) {
                            detail.author = author;
                        }
                        const dateText = content('.article-sm span').first().text() || (universityArticle ? content('.con-tit .shfffff span').first().text() : '');
                        const date = dateText.match(/\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2})?/)?.[0];
                        if (date) {
                            detail.pubDate = timezone(parseDate(date, date.length > 10 ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'), 8);
                        }
                    } else {
                        detail.description = content('#zoom').html();
                        detail.pubDate = timezone(
                            parseDate(
                                content('.sub_tit3 strong')
                                    .first()
                                    .text()
                                    .replace(/发布时间：/, '')
                            ),
                            8
                        );
                    }
                    return detail;
                }),
                (detail) => ({ ...item, ...detail })
            ),
        { concurrency: 3, stopOnError: false }
    );
    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
async function mapResolvedValue<T, U>(promise: Promise<T>, mapper: (value: T) => U | Promise<U>): Promise<U> {
    const value = await promise;
    return mapper(value);
}
function mapElements<T, U>(selection: Cheerio<T>, mapper: (index: number, node: T) => U | U[] | null | undefined): U[] {
    return selection.toArray().flatMap((node, index) => mapper(index, node) ?? []);
}
