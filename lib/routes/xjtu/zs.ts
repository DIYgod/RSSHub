import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document, type Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'zsxx1/zskx' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);
    const baseUrl = 'https://zs.xjtu.edu.cn';
    const targetUrl = `${baseUrl}/${category}.htm`;
    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'zh') as Language;
    let items: DataItem[] = $('section.TextList ul li')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('a.flex');
            const title: string = $aEl.text();
            const pubDateStr: string | undefined = $el.find('b').text();
            const linkUrl: string | undefined = $aEl.attr('href');
            const categoryEls: Element[] = $el.find('i.zc').toArray();
            const categories: string[] = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, targetUrl).href : undefined,
                category: categories,
                language,
            };
            return processedItem;
        });
    items = (
        await pMap(
            items,
            (item) => {
                if (!item.link) {
                    return item;
                }
                return mapResolvedValue(
                    cache.tryGet(`xjtu:zs:content:v5:${item.link}`, async (): Promise<DataItem> => {
                        const detailResponse = await ofetch(item.link!);
                        const $$: CheerioAPI = load(detailResponse);
                        const title: string = $$('div.show01 h5').text();
                        const body = $$('div.v_news_content').first();
                        if (!body.html()?.trim()) {
                            throw new Error(`Unable to find article content at ${item.link}`);
                        }
                        const attachmentLinks = new Set(mapElements(body.find('a[href]'), (_, attachment) => $$(attachment).attr('href')));
                        $$('[name="_newscontent_fromname"] a[href*="download.jsp"]')
                            .filter((_, attachment) => {
                                const href = $$(attachment).attr('href')!;
                                if ($$(attachment).closest('.v_news_content').length || attachmentLinks.has(href)) {
                                    return false;
                                }
                                attachmentLinks.add(href);
                                return true;
                            })
                            .each((_, attachment) => {
                                const attachmentWrapper1 = $$('<p/>');
                                attachmentWrapper1.append(copyContent($$(attachment), $$));
                                body.append(attachmentWrapper1);
                            });
                        const description: string | undefined = body.html() ?? undefined;
                        const pubDateStr: string | undefined = $$('div.show01 i')
                            .text()
                            ?.match(/(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/)?.[1];
                        const categoryEls: Element[] = $$('div.mianbao a').slice(1).toArray();
                        const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
                        const processedItem: DataItem = {
                            title,
                            description,
                            pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : undefined,
                            category: categories,
                            content: {
                                html: description,
                                text: body.text(),
                            },
                        };
                        return processedItem;
                    }),
                    (detail) => ({ ...item, ...detail, pubDate: detail.pubDate ?? item.pubDate, language })
                );
            },
            { concurrency: 3, stopOnError: false }
        )
    ).filter((_): _ is DataItem => true);
    const title: string = $('title').text();
    const image = $('div.logoimg img').attr('src');
    return {
        title,
        description: title.split(/-/, 1)[0],
        link: targetUrl,
        item: items,
        image: image ? new URL(image, targetUrl).href : undefined,
        author: $('META[Name="keywords"]').attr('Content'),
        language,
        id: targetUrl,
    };
};
export const route: Route = {
    path: '/zs/:category{.+}?',
    name: '本科招生网',
    url: 'zs.xjtu.edu.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/xjtu/zs/zsxx1/zskx',
    parameters: {
        category: {
            description: '分类，默认为 zsxx1/zskx，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '招生快讯',
                    value: 'zsxx1/zskx',
                },
                {
                    label: '招生政策',
                    value: 'zsxx1/zszc',
                },
                {
                    label: '招生计划',
                    value: 'zsxx1/zsjh',
                },
                {
                    label: '阳光公告',
                    value: 'zsxx1/yggg',
                },
                {
                    label: '历年录取',
                    value: 'zsxx1/lnlq',
                },
            ],
        },
    },
    description: `::: tip
若订阅 [招生快讯](https://zs.xjtu.edu.cn/zsxx1/zskx.htm)，网址为 \`https://zs.xjtu.edu.cn/zsxx1/zskx.htm\`，请截取 \`https://zs.xjtu.edu.cn/\` 到末尾 \`.htm\` 的部分 \`zsxx1/zskx\` 作为 \`category\` 参数填入，此时目标路由为 [\`/xjtu/zs/zsxx1/zskx\`](https://rsshub.app/xjtu/zs/zsxx1/zskx)。
:::

| [招生快讯](https://zs.xjtu.edu.cn/zsxx1/zskx.htm)   | [招生政策](https://zs.xjtu.edu.cn/zsxx1/zszc.htm)   | [招生计划](https://zs.xjtu.edu.cn/zsxx1/zsjh.htm)   | [阳光公告](https://zs.xjtu.edu.cn/zsxx1/yggg.htm)   | [历年录取](https://zs.xjtu.edu.cn/zsxx1/lnlq.htm)   |
| --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| [zsxx1/zskx](https://rsshub.app/xjtu/zs/zsxx1/zskx) | [zsxx1/zszc](https://rsshub.app/xjtu/zs/zsxx1/zszc) | [zsxx1/zsjh](https://rsshub.app/xjtu/zs/zsxx1/zsjh) | [zsxx1/yggg](https://rsshub.app/xjtu/zs/zsxx1/yggg) | [zsxx1/lnlq](https://rsshub.app/xjtu/zs/zsxx1/lnlq) |`,
    categories: ['university'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['zs.xjtu.edu.cn/:category'],
            target: (params) => {
                const category: string = params.category;
                return `/xjtu/zs${category ? `/${category}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,
};
async function mapResolvedValue<T, U>(promise: Promise<T>, mapper: (value: T) => U | Promise<U>): Promise<U> {
    const value = await promise;
    return mapper(value);
}
function mapElements<T, U>(selection: Cheerio<T>, mapper: (index: number, node: T) => U | U[] | null | undefined): U[] {
    return selection.toArray().flatMap((node, index) => mapper(index, node) ?? []);
}
function copyContent<T extends AnyNode>(selection: Cheerio<T>, $: CheerioAPI): Cheerio<T> {
    const nodes = selection.toArray().map((node) => cloneNode(node, true));
    const root = new Document(nodes);
    for (const node of nodes) {
        node.parent = root;
    }
    return $(nodes);
}
