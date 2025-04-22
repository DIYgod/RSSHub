import path from 'node:path';

import { type CheerioAPI, type Cheerio, type Element, load } from 'cheerio';
import { type Context } from 'hono';

import { type DataItem, type Route, type Data, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '10', 10);

    const baseUrl: string = 'https://www.oschina.net';
    const userHostRegex: string = String.raw`https://my\.oschina\.net`;
    const targetUrl: string = new URL(`news/column?columnId=${id}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language: string = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = $('div.news-item')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('div.title').text();
            const description: string = art(path.join(__dirname, 'templates/description.art'), {
                intro: $el.find('div.description p.line-clamp').text(),
            });
            const pubDateStr: string | undefined = $el.find('inddiv.item').contents().last().text().trim();
            const linkUrl: string | undefined = $el.attr('data-url');
            const authorEls: Element[] = $el.find('inddiv.item a').toArray();
            const authors: DataItem['author'] = authorEls.map((authorEl) => {
                const $authorEl: Cheerio<Element> = $(authorEl);

                return {
                    name: $authorEl.text(),
                    url: $authorEl.attr('href'),
                };
            });
            const image: string | undefined = $el.find('img').attr('src');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : undefined,
                link: linkUrl,
                author: authors,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                updated: upDatedStr ? timezone(parseDate(upDatedStr), +8) : undefined,
                language,
            };

            return processedItem;
        });

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    $$('.ad-wrap').remove();

                    const title: string = $$('h1.article-box__title').text();
                    const description: string = art(path.join(__dirname, 'templates/description.art'), {
                        description: $$('div.content').html(),
                    });
                    const pubDateEl: Element = $$('div.article-box__meta div.item-list div.item')
                        .toArray()
                        .find((i) => /\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/.test($$(i).text()));
                    const pubDateStr: string | undefined = pubDateEl ? $$(pubDateEl).text() : undefined;
                    const linkUrl: string | undefined = $$('val[data-name="shareUrl"]').attr('data-value');
                    const categoryEls: Element[] = [...$$('div.breadcrumb-box a.item').toArray().slice(0, -1), ...$$('div.article-box__meta div.item-list div.item span.label').toArray(), ...$$('div.tags-box a.tag-item').toArray()];
                    const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
                    const authorEls: Element[] = $$('div.article-box__meta div.item-list div.item a')
                        .toArray()
                        .filter((i) => ($$(i).attr('href') ? new RegExp(`^${userHostRegex}/u/\\d+$`).test($$(i).attr('href') as string) : false));
                    const authors: DataItem['author'] = authorEls.map((authorEl) => {
                        const $authorEl: Cheerio<Element> = $$(authorEl);

                        return {
                            name: $authorEl.text(),
                            url: $authorEl.attr('href'),
                        };
                    });
                    const guid: string = `oschina-${$$('val[data-name="objId"]').attr('data-value')}`;
                    const image: string | undefined = $$('val[data-name="sharePic"]').attr('data-value');
                    const upDatedStr: string | undefined = $$('meta[property="bytedance:updated_time"]').attr('content') || pubDateStr;

                    let processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
                        link: linkUrl ? new URL(linkUrl, baseUrl).href : item.link,
                        category: categories,
                        author: authors,
                        guid,
                        id: guid,
                        content: {
                            html: description,
                            text: description,
                        },
                        image,
                        banner: image,
                        updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
                        language,
                    };

                    const extraLinkEls: Element[] = $$('div.related-links-box ul.link-list li a').toArray();
                    const extraLinks = extraLinkEls
                        .map((extraLinkEl) => {
                            const $$extraLinkEl: Cheerio<Element> = $$(extraLinkEl);

                            return {
                                url: $$extraLinkEl.attr('href'),
                                type: 'related',
                                content_html: $$extraLinkEl.parent().html(),
                            };
                        })
                        .filter((_): _ is { url: string; type: string; content_html: string } => true);

                    if (extraLinks) {
                        processedItem = {
                            ...processedItem,
                            _extra: {
                                links: extraLinks,
                            },
                        };
                    }

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    const author: string | undefined = $('a.logo').attr('title');

    return {
        title: `${author} - ${$('div#tabDropdownListOpen a.selected').text()}`,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('a.logo img').attr('src'),
        author,
        language,
        id: $('val[data-name="weixinShareUrl"]').attr('data-value'),
    };
};

export const route: Route = {
    path: '/column/:id',
    name: '专栏',
    url: 'www.oschina.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/oschina/column/14',
    parameters: {
        id: '专栏 id，可在对应专栏页 URL 中找到',
    },
    description: `:::tip
若订阅 [开源安全专栏](https://www.oschina.net/news/column?columnId=14)，网址为 \`https://www.oschina.net/news/column?columnId=14\`，请截取 \`https://www.oschina.net/news/column?columnId=\` 到末尾的部分 \`14\` 作为 \`id\` 参数填入，此时目标路由为 [\`/oschina/column/14\`](https://rsshub.app/oschina/column/14)。

:::

<details>
<summary>更多专栏</summary>

| 名称            | ID  |
| --------------- | --- |
| 古典主义 Debian | 4   |
| 自由&开源       | 5   |
| 溯源            | 6   |
| 开源先懂协议    | 7   |
| 开源变局        | 8   |
| 创造者说        | 9   |
| 精英主义 BSD    | 10  |
| 苹果有开源      | 11  |
| 开源访谈        | 12  |
| 抱团找组织      | 13  |
| 开源安全        | 14  |
| OSPO            | 15  |
| 创业小辑        | 16  |
| 星推荐          | 17  |
| 单口开源        | 18  |
| 编辑部观察直播  | 19  |
| 开源商业化      | 20  |
| ChatGPT 专题    | 21  |
| 开源新思        | 24  |
| 开源日报        | 25  |
| 大模型思辨      | 26  |
| 家里有个程序员  | 27  |
| 开源漫谈        | 23  |

</details>
`,
    categories: ['programming'],
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
            source: ['www.oschina.net'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const id: string | undefined = urlObj.searchParams.get('id') ?? undefined;

                return `/oschina/column/${id}`;
            },
        },
    ],
    view: ViewType.Articles,
};
