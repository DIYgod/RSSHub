import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id = '9' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl = 'https://dbaplus.cn';
    const targetUrl: string = new URL(`news-${id}-1.html`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = $('ul.media-list li.media')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('h3.media-heading a');

            const title: string = $aEl.text();
            const image: string | undefined = $el.find('img.media-object').attr('src');
            const description: string | undefined = renderDescription({
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                intro: $el.find('div.mt10').html(),
            });
            const pubDateStr: string | undefined = $el
                .find('span.time')
                .text()
                .replaceAll(/(年|月)/g, '-')
                .replace('日', '');
            const linkUrl: string | undefined = $aEl.attr('href');
            const authorEls: Element[] = $el.find('span.user').toArray();
            const authors: DataItem['author'] = authorEls.map((authorEl) => {
                const $authorEl: Cheerio<Element> = $(authorEl);

                return {
                    name: $authorEl.text(),
                    url: undefined,
                    avatar: undefined,
                };
            });
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl,
                author: authors,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
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

                const title: string = $$('h2.title').text();
                const description: string | undefined =
                    item.description +
                    renderDescription({
                        description: $$('div.new-detailed').html(),
                    });
                const pubDateStr: string | undefined = $$('span.time').first().text();
                const categories: string[] = $$('meta[name="keywords"]').attr('content')?.split(',') ?? [];
                const authorEls: Element[] = $$('span.user').toArray();
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl);

                    return {
                        name: $$authorEl.text(),
                        url: undefined,
                        avatar: undefined,
                    };
                });
                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
                    category: categories,
                    author: authors,
                    content: {
                        html: description,
                        text: description,
                    },
                    updated: upDatedStr ? timezone(parseDate(upDatedStr), +8) : item.updated,
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    const description: string = $('meta[name="description"]').attr('content') ?? '';

    return {
        title: $('title').text().split(/：/)[0],
        description,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('div.navbar-header img').attr('src'),
        author: description.split(/：/)[0],
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/news/:id?',
    name: '资讯',
    url: 'dbaplus.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/dbaplus/news/9',
    parameters: {
        category: {
            description: '分类，默认为 `9`，即全部，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '全部',
                    value: '9',
                },
                {
                    label: '数据库',
                    value: '153',
                },
                {
                    label: '国产数据库',
                    value: '217',
                },
                {
                    label: 'ORACLE',
                    value: '10',
                },
                {
                    label: 'MySQL',
                    value: '11',
                },
                {
                    label: 'SQL优化',
                    value: '155',
                },
                {
                    label: 'Newsletter',
                    value: '156',
                },
                {
                    label: '其它',
                    value: '154',
                },
                {
                    label: '运维',
                    value: '134',
                },
                {
                    label: '大数据',
                    value: '73',
                },
                {
                    label: '架构',
                    value: '141',
                },
                {
                    label: 'PaaS云',
                    value: '72',
                },
                {
                    label: '职场生涯',
                    value: '149',
                },
                {
                    label: '标准评估',
                    value: '248',
                },
                {
                    label: '这里有毒',
                    value: '21',
                },
                {
                    label: '最新活动',
                    value: '152',
                },
                {
                    label: '往期干货',
                    value: '148',
                },
                {
                    label: '特别策划',
                    value: '150',
                },
                {
                    label: '荐书',
                    value: '151',
                },
            ],
        },
    },
    description: `::: tip
订阅 [资讯](https://dbaplus.cn/news-9-1.html)，其源网址为 \`https://dbaplus.cn/news-9-1.html\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/dbaplus/news/9\`](https://rsshub.app/dbaplus/news/9)。
:::

<details>
  <summary>更多分类</summary>

  | [全部](https://dbaplus.cn/news-9-1.html) | [数据库](https://dbaplus.cn/news-153-1.html) | [运维](https://dbaplus.cn/news-134-1.html) | [大数据](https://dbaplus.cn/news-73-1.html) | [架构](https://dbaplus.cn/news-141-1.html) |
  | ---------------------------------------- | -------------------------------------------- | ------------------------------------------ | ------------------------------------------- | ------------------------------------------ |
  | [9](https://rsshub.app/dbaplus/news/9)   | [153](https://rsshub.app/dbaplus/news/153)   | [134](https://rsshub.app/dbaplus/news/134) | [73](https://rsshub.app/dbaplus/news/73)    | [141](https://rsshub.app/dbaplus/news/141) |

  | [PaaS云](https://dbaplus.cn/news-72-1.html) | [职场生涯](https://dbaplus.cn/news-149-1.html) | [标准评估](https://dbaplus.cn/news-248-1.html) | [这里有毒](https://dbaplus.cn/news-21-1.html) |
  | ------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | --------------------------------------------- |
  | [72](https://rsshub.app/dbaplus/news/72)    | [149](https://rsshub.app/dbaplus/news/149)     | [248](https://rsshub.app/dbaplus/news/248)     | [21](https://rsshub.app/dbaplus/news/21)      |

  #### [数据库](https://dbaplus.cn/news-153-1.html)

  | [国产数据库](https://dbaplus.cn/news-217-1.html) | [ORACLE](https://dbaplus.cn/news-10-1.html) | [MySQL](https://dbaplus.cn/news-11-1.html) | [SQL优化](https://dbaplus.cn/news-155-1.html) | [Newsletter](https://dbaplus.cn/news-156-1.html) |
  | ------------------------------------------------ | ------------------------------------------- | ------------------------------------------ | --------------------------------------------- | ------------------------------------------------ |
  | [217](https://rsshub.app/dbaplus/news/217)       | [10](https://rsshub.app/dbaplus/news/10)    | [11](https://rsshub.app/dbaplus/news/11)   | [155](https://rsshub.app/dbaplus/news/155)    | [156](https://rsshub.app/dbaplus/news/156)       |

  | [其它](https://dbaplus.cn/news-154-1.html) |
  | ------------------------------------------ |
  | [154](https://rsshub.app/dbaplus/news/154) |

  #### [这里有毒](https://dbaplus.cn/news-21-1.html)

  | [最新活动](https://dbaplus.cn/news-152-1.html) | [往期干货](https://dbaplus.cn/news-148-1.html) | [特别策划](https://dbaplus.cn/news-150-1.html) | [荐书](https://dbaplus.cn/news-151-1.html) |
  | ---------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | ------------------------------------------ |
  | [152](https://rsshub.app/dbaplus/news/152)     | [148](https://rsshub.app/dbaplus/news/148)     | [150](https://rsshub.app/dbaplus/news/150)     | [151](https://rsshub.app/dbaplus/news/151) |

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
            source: ['dbaplus.cn/news*'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const href: string = urlObj.href;
                const id: string | undefined = href.match(/-(\d+)-\.html/)?.[1];

                return `/dbaplus/news${id ? `/${id}` : ''}`;
            },
        },
        {
            title: '全部',
            source: ['dbaplus.cn/news-9-1.html'],
            target: '/news/9',
        },
        {
            title: '数据库',
            source: ['dbaplus.cn/news-153-1.html'],
            target: '/news/153',
        },
        {
            title: '国产数据库',
            source: ['dbaplus.cn/news-217-1.html'],
            target: '/news/217',
        },
        {
            title: 'ORACLE',
            source: ['dbaplus.cn/news-10-1.html'],
            target: '/news/10',
        },
        {
            title: 'MySQL',
            source: ['dbaplus.cn/news-11-1.html'],
            target: '/news/11',
        },
        {
            title: 'SQL优化',
            source: ['dbaplus.cn/news-155-1.html'],
            target: '/news/155',
        },
        {
            title: 'Newsletter',
            source: ['dbaplus.cn/news-156-1.html'],
            target: '/news/156',
        },
        {
            title: '其它',
            source: ['dbaplus.cn/news-154-1.html'],
            target: '/news/154',
        },
        {
            title: '运维',
            source: ['dbaplus.cn/news-134-1.html'],
            target: '/news/134',
        },
        {
            title: '大数据',
            source: ['dbaplus.cn/news-73-1.html'],
            target: '/news/73',
        },
        {
            title: '架构',
            source: ['dbaplus.cn/news-141-1.html'],
            target: '/news/141',
        },
        {
            title: 'PaaS云',
            source: ['dbaplus.cn/news-72-1.html'],
            target: '/news/72',
        },
        {
            title: '职场生涯',
            source: ['dbaplus.cn/news-149-1.html'],
            target: '/news/149',
        },
        {
            title: '标准评估',
            source: ['dbaplus.cn/news-248-1.html'],
            target: '/news/248',
        },
        {
            title: '这里有毒',
            source: ['dbaplus.cn/news-21-1.html'],
            target: '/news/21',
        },
        {
            title: '最新活动',
            source: ['dbaplus.cn/news-152-1.html'],
            target: '/news/152',
        },
        {
            title: '往期干货',
            source: ['dbaplus.cn/news-148-1.html'],
            target: '/news/148',
        },
        {
            title: '特别策划',
            source: ['dbaplus.cn/news-150-1.html'],
            target: '/news/150',
        },
        {
            title: '荐书',
            source: ['dbaplus.cn/news-151-1.html'],
            target: '/news/151',
        },
    ],
    view: ViewType.Articles,
};
