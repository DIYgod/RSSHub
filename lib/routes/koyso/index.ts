import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { type CheerioAPI, type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';
import path from 'node:path';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = '0', sort = 'latest' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://koyso.to';
    const targetUrl: string = new URL(`?${category === '0' ? '' : `category=${category}&`}sort=${sort}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = $('a.game_item')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('div.game_info').text();
            const image: string | undefined = $el.find('div.game_media img').attr('data-src');
            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
            });
            const linkUrl: string | undefined = $el.attr('href');

            const processedItem: DataItem = {
                title,
                description,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
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

                $$('div.ind').remove();
                $$('div.download_div').remove();

                const title: string = $$('h1.content_title').text();

                $$('h1.content_title').remove();

                const description: string | undefined = item.description + ($$('div.game_content').html() || '');

                const processedItem: DataItem = {
                    title,
                    description,
                    content: {
                        html: description,
                        text: description,
                    },
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    const categoryName: string = $(`ul.category li#category_${category}`).text();
    const sortName: string = $(`div.genres_content ul li.${sort}`).text();

    return {
        title: `${$('title').text()} - ${categoryName} - ${sortName}`,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/:category?/:sort?',
    name: '游戏',
    url: 'koyso.to',
    maintainers: ['nczitzk'],
    handler,
    example: '/koyso/0/latest',
    parameters: {
        category: {
            description: '排序，默认为 `0`，即全部，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '全部游戏',
                    value: '0',
                },
                {
                    label: '动作游戏',
                    value: '3',
                },
                {
                    label: '冒险游戏',
                    value: '5',
                },
                {
                    label: '绅士游戏',
                    value: '7',
                },
                {
                    label: '射击游戏',
                    value: '1',
                },
                {
                    label: '休闲游戏',
                    value: '2',
                },
                {
                    label: '体育竞速',
                    value: '4',
                },
                {
                    label: '模拟经营',
                    value: '6',
                },
                {
                    label: '角色扮演',
                    value: '8',
                },
                {
                    label: '策略游戏',
                    value: '9',
                },
                {
                    label: '格斗游戏',
                    value: '10',
                },
                {
                    label: '恐怖游戏',
                    value: '11',
                },
                {
                    label: '即时战略',
                    value: '12',
                },
                {
                    label: '卡牌游戏',
                    value: '13',
                },
                {
                    label: '独立游戏',
                    value: '14',
                },
                {
                    label: '局域网联机',
                    value: '15',
                },
            ],
        },
        sort: {
            description: '排序，默认为 `latest`，即最新，可在对应页 URL 中找到',
            options: [
                {
                    label: '热度',
                    value: 'views',
                },
                {
                    label: '最新',
                    value: 'latest',
                },
            ],
        },
    },
    description: `::: tip
订阅 [最新动作游戏](https://koyso.to/?category=3&sort=latest)，其源网址为 \`https://koyso.to/?category=3&sort=latest\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/koyso/3/latest\`](https://koyso.to/?category=3&sort=latest)。
:::

#### 分类

| 分类                                        | ID                                |
| ------------------------------------------- | --------------------------------- |
| [全部游戏](https://koyso.to/)               | [0](https://rsshub.app/koyso/0)   |
| [动作游戏](https://koyso.to/?category=3)    | [3](https://rsshub.app/koyso/3)   |
| [冒险游戏](https://koyso.to/?category=5)    | [5](https://rsshub.app/koyso/5)   |
| [绅士游戏](https://koyso.to/?category=7)    | [7](https://rsshub.app/koyso/7)   |
| [射击游戏](https://koyso.to/?category=1)    | [1](https://rsshub.app/koyso/1)   |
| [休闲游戏](https://koyso.to/?category=2)    | [2](https://rsshub.app/koyso/2)   |
| [体育竞速](https://koyso.to/?category=4)    | [4](https://rsshub.app/koyso/4)   |
| [模拟经营](https://koyso.to/?category=6)    | [6](https://rsshub.app/koyso/6)   |
| [角色扮演](https://koyso.to/?category=8)    | [8](https://rsshub.app/koyso/8)   |
| [策略游戏](https://koyso.to/?category=9)    | [9](https://rsshub.app/koyso/9)   |
| [格斗游戏](https://koyso.to/?category=10)   | [10](https://rsshub.app/koyso/10) |
| [恐怖游戏](https://koyso.to/?category=11)   | [11](https://rsshub.app/koyso/11) |
| [即时战略](https://koyso.to/?category=12)   | [12](https://rsshub.app/koyso/12) |
| [卡牌游戏](https://koyso.to/?category=13)   | [13](https://rsshub.app/koyso/13) |
| [独立游戏](https://koyso.to/?category=14)   | [14](https://rsshub.app/koyso/14) |
| [局域网联机](https://koyso.to/?category=15) | [15](https://rsshub.app/koyso/15) |

#### 排序

| 排序                                  | ID                                          |
| ------------------------------------- | ------------------------------------------- |
| [热度](https://koyso.to/?sort=views)  | [views](https://rsshub.app/koyso/0/views)   |
| [最新](https://koyso.to/?sort=latest) | [latest](https://rsshub.app/koyso/0/latest) |
`,
    categories: ['game'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['koyso.to'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const category: string | undefined = urlObj.searchParams.get('category') ?? undefined;
                const sort: string | undefined = urlObj.searchParams.get('sort') ?? undefined;

                return `/koyso${category ? `/${category}` : '0'}${sort ? `/${sort}` : ''}`;
            },
        },
        {
            title: '全部游戏',
            source: ['koyso.to'],
            target: '/0',
        },
        {
            title: '动作游戏',
            source: ['koyso.to'],
            target: '/3',
        },
        {
            title: '冒险游戏',
            source: ['koyso.to'],
            target: '/5',
        },
        {
            title: '绅士游戏',
            source: ['koyso.to'],
            target: '/7',
        },
        {
            title: '射击游戏',
            source: ['koyso.to'],
            target: '/1',
        },
        {
            title: '休闲游戏',
            source: ['koyso.to'],
            target: '/2',
        },
        {
            title: '体育竞速',
            source: ['koyso.to'],
            target: '/4',
        },
        {
            title: '模拟经营',
            source: ['koyso.to'],
            target: '/6',
        },
        {
            title: '角色扮演',
            source: ['koyso.to'],
            target: '/8',
        },
        {
            title: '策略游戏',
            source: ['koyso.to'],
            target: '/9',
        },
        {
            title: '格斗游戏',
            source: ['koyso.to'],
            target: '/10',
        },
        {
            title: '恐怖游戏',
            source: ['koyso.to'],
            target: '/11',
        },
        {
            title: '即时战略',
            source: ['koyso.to'],
            target: '/12',
        },
        {
            title: '卡牌游戏',
            source: ['koyso.to'],
            target: '/13',
        },
        {
            title: '独立游戏',
            source: ['koyso.to'],
            target: '/14',
        },
        {
            title: '局域网联机',
            source: ['koyso.to'],
            target: '/15',
        },
    ],
    view: ViewType.Articles,
};
