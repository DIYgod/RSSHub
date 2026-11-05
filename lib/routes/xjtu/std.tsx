import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/std/:category?',
    categories: ['university'],
    example: '/xjtu/std/zytz',
    parameters: { category: '分类，见下表，默认为通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '科技在线',
    maintainers: ['nczitzk'],
    handler,
    description: `| 通知公告 | 重要通知 | 项目申报 | 成果申报 | 信息快讯 |
| -------- | -------- | -------- | -------- | -------- |
|          | zytz     | xmsb     | cgsb     | xxkx     |`,
};
async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';
    const rootUrl = 'http://std.xjtu.edu.cn';
    const currentUrl = `${rootUrl}/tzgg${category ? `/${category}` : ''}.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = load(response.data);
    let items = $('li[data-aos="fade-up"] a.flex[href]')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.find('h2').text(),
                link: new URL($item.attr('href')!, currentUrl).href,
            };
        });
    items = await pMap(
        items,
        (item) =>
            mapResolvedValue(
                cache.tryGet(`xjtu:std:content:v2:${item.link}`, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = load(detailResponse.data);
                    const body = content('[name="_newscontent_fromname"] .v_news_content').first();
                    content('[name="_newscontent_fromname"] a[href*="download.jsp"]')
                        .filter((_, attachment) => !content(attachment).closest('.v_news_content').length)
                        .each((_, attachment) => {
                            const attachmentWrapper1 = content('<p/>');
                            attachmentWrapper1.append(copyContent(content(attachment), content));
                            body.append(attachmentWrapper1);
                        });
                    const date = content('.conttime span')
                        .first()
                        .text()
                        .match(/\d{4}-\d{2}-\d{2}/)?.[0];
                    return {
                        description: body.html() ?? undefined,
                        pubDate: date ? timezone(parseDate(date, 'YYYY-MM-DD'), 8) : undefined,
                    };
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
function copyContent<T extends AnyNode>(selection: Cheerio<T>, $: CheerioAPI): Cheerio<T> {
    const nodes = selection.toArray().map((node) => cloneNode(node, true));
    const root = new Document(nodes);
    for (const node of nodes) {
        node.parent = root;
    }
    return $(nodes);
}
