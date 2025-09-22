import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { type CheerioAPI, type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';
import path from 'node:path';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id = 'tzgg' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '10', 10);

    const baseUrl: string = 'https://hitgs.hit.edu.cn';
    const targetUrl: string = new URL(`${id}/list.htm`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = [];

    items = $('li.news, div.tbt17')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('div.news_title, span.div.news_title, div.bttb2').text();
            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                intro: $el.find('div.news_text, div.jj5').text(),
            });
            const pubDateStr: string | undefined = $('span.news_meta').text() || ($('span.news_days').text() ? `${$('span.news_days').text()}-${$('span.news_year').text()}` : `${$('div.tm-3').text()}-${$('div.tm-1').text()}`);
            const linkUrl: string | undefined = $el.find('div.news_title a').attr('href') ?? $el.find('div.bttb2 a').attr('href') ?? $el.find('a').attr('href');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: parseDate(pubDateStr),
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                content: {
                    html: description,
                    text: description,
                },
                updated: parseDate(upDatedStr),
                language,
            };

            return processedItem;
        });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('h1.arti_title').text() + $$('h2.arti_title').text();
                const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                    description: $$('div.wp_articlecontent').html(),
                });
                const pubDateStr: string | undefined = $$('span.arti_update').text().split(/：/).pop()?.trim();
                const upDatedStr: string | undefined = pubDateStr;

                let processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                    content: {
                        html: description,
                        text: description,
                    },
                    updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
                    language,
                };

                const $enclosureEl: Cheerio<Element> = $$('a[sudyfile-attr]')
                    .filter((_, el) => {
                        const $el: Cheerio<Element> = $$(el);

                        return !$el.attr('href')?.endsWith('htm');
                    })
                    .first();

                const enclosureUrl: string | undefined = $enclosureEl.attr('href');

                if (enclosureUrl) {
                    const enclosureType: string = `application/${enclosureUrl.split(/\./).pop() || 'octet-stream'}`;
                    const enclosureTitle: string | undefined = $enclosureEl.attr('sudyfile-attr')?.match(/'title':'(.*?)'/)?.[1];

                    processedItem = {
                        ...processedItem,
                        enclosure_url: new URL(enclosureUrl, baseUrl).href,
                        enclosure_type: enclosureType,
                        enclosure_title: enclosureTitle || title,
                    };
                }

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    const title: string = $('title').text();
    const author: string = $('p.copyright span').first().text().split(/©/).pop() ?? '';

    return {
        title: `${author ? `${author} - ` : ''}${title}`,
        description: title,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('div.foot-logo img').attr('src'),
        author,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/hitgs/:id?',
    name: '研究生院',
    url: 'hitgs.hit.edu.cn',
    maintainers: ['hlmu', 'nczitzk'],
    handler,
    example: '/hit/hitgs/tzgg',
    parameters: {
        category: {
            description: '分类，默认为 `tzgg`，即通知公告，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '通知公告',
                    value: 'tzgg',
                },
                {
                    label: '综合新闻',
                    value: 'zhxw',
                },
                {
                    label: '高水平课程与学术交流',
                    value: 'gspkcyxsjl',
                },
                {
                    label: '国家政策',
                    value: 'gjzc',
                },
                {
                    label: '规章制度',
                    value: '17546',
                },
                {
                    label: '办事流程',
                    value: '17547',
                },
                {
                    label: '常见问题',
                    value: '17548',
                },
                {
                    label: '常见下载',
                    value: '17549',
                },
            ],
        },
    },
    description: `:::tip
订阅 [通知公告](https://hitgs.hit.edu.cn/tzgg/list.htm)，其源网址为 \`https://hitgs.hit.edu.cn/tzgg/list.htm\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/hit/hitgs/tzgg\`](https://rsshub.app/hit/hitgs/tzgg)。
:::

<details>
  <summary>更多栏目</summary>

| 栏目 | ID |
| - | - |
| [通知公告](https://hitgs.hit.edu.cn/tzgg/list.htm) | [tzgg](https://rsshub.app/hit/hitgs/tzgg) |
| [综合新闻](https://hitgs.hit.edu.cn/zhxw/list.htm) | [zhxw](https://rsshub.app/hit/hitgs/zhxw) |
| [高水平课程与学术交流](https://hitgs.hit.edu.cn/gspkcyxsjl/list.htm) | [gspkcyxsjl](https://rsshub.app/hit/hitgs/gspkcyxsjl) |
| [国家政策](https://hitgs.hit.edu.cn/gjzc/list.htm) | [gjzc](https://rsshub.app/hit/hitgs/gjzc) |
| [规章制度](https://hitgs.hit.edu.cn/17546/list.htm) | [17546](https://rsshub.app/hit/hitgs/17546) |
| [办事流程](https://hitgs.hit.edu.cn/17547/list.htm) | [17547](https://rsshub.app/hit/hitgs/17547) |
| [常见问题](https://hitgs.hit.edu.cn/17548/list.htm) | [17548](https://rsshub.app/hit/hitgs/17548) |
| [常见下载](https://hitgs.hit.edu.cn/17549/list.htm) | [17549](https://rsshub.app/hit/hitgs/17549) |

</details>
`,
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
            source: ['hitgs.hit.edu.cn', 'hitgs.hit.edu.cn/:id/list.htm'],
            target: (params) => {
                const id: string = params.id;

                return `/hit/hitgs${id ? `/${id}` : ''}`;
            },
        },
        {
            title: '通知公告',
            source: ['hitgs.hit.edu.cn/tzgg/list.htm'],
            target: '/hitgs/tzgg',
        },
        {
            title: '综合新闻',
            source: ['hitgs.hit.edu.cn/zhxw/list.htm'],
            target: '/hitgs/zhxw',
        },
        {
            title: '高水平课程与学术交流',
            source: ['hitgs.hit.edu.cn/gspkcyxsjl/list.htm'],
            target: '/hitgs/gspkcyxsjl',
        },
        {
            title: '国家政策',
            source: ['hitgs.hit.edu.cn/gjzc/list.htm'],
            target: '/hitgs/gjzc',
        },
        {
            title: '规章制度',
            source: ['hitgs.hit.edu.cn/17546/list.htm'],
            target: '/hitgs/17546',
        },
        {
            title: '办事流程',
            source: ['hitgs.hit.edu.cn/17547/list.htm'],
            target: '/hitgs/17547',
        },
        {
            title: '常见问题',
            source: ['hitgs.hit.edu.cn/17548/list.htm'],
            target: '/hitgs/17548',
        },
        {
            title: '常见下载',
            source: ['hitgs.hit.edu.cn/17549/list.htm'],
            target: '/hitgs/17549',
        },
    ],
    view: ViewType.Articles,
};
