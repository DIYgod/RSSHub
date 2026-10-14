import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const categoryPaths = {
    '0': '',
    '1': 'shooting',
    '2': 'casual',
    '3': 'action',
    '4': 'sports_racing',
    '5': 'adventure',
    '6': 'simulation',
    '7': 'r18',
    '8': 'rpg',
    '9': 'strategy',
    '10': 'fighting',
    '11': 'horror',
    '12': 'rts',
    '13': 'card',
    '14': 'indie',
    '15': 'lan',
};

type DescriptionImage = {
    src?: string;
    alt?: string;
};

const renderDescription = (images?: DescriptionImage[]) =>
    renderToString(
        <>
            {images?.map((image) =>
                image?.src ? (
                    <figure>
                        <img src={image.src} alt={image.alt ?? undefined} />
                    </figure>
                ) : null
            )}
        </>
    );

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = '0', sort = 'latest' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);
    const candidateLimit = ctx.req.query('sorted') === 'false' ? limit : Math.max(30, limit);

    const baseUrl = 'https://playzip.com';
    if (!Object.hasOwn(categoryPaths, category)) {
        throw new InvalidParameterError('Unknown game category: use an ID from the category table.');
    }
    const targetUrl = new URL(category === '0' ? '/' : `/category/${categoryPaths[category]}`, baseUrl);
    targetUrl.searchParams.set('sort', sort);

    const response = await ofetch(targetUrl.href);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'en') as Language;

    let items: DataItem[] = $('a.game_item')
        .slice(0, candidateLimit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('div.game_info').text();
            const image: string | undefined = $el.find('div.game_media img').attr('data-src');
            const description: string | undefined = renderDescription(
                image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined
            );
            const linkUrl: string | undefined = $el.attr('href');

            const processedItem: DataItem = {
                title,
                description,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                content: {
                    html: description,
                    text: '',
                },
                image,
                banner: image,
                language,
            };

            return processedItem;
        });

    items = await pMap(
        items,
        (item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                $$('div.ind').remove();
                $$('div.download_div').remove();

                const title: string = $$('h1.content_title').text();

                $$('h1.content_title').remove();

                const published = $$('meta[property="article:published_time"]').attr('content');
                const modified = $$('meta[property="article:modified_time"]').attr('content');
                const content = $$('div.content_body').length ? $$('div.content_body') : $$('div.game_content');
                const description = item.description + (content.html() || '');

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: published ? parseDate(published) : undefined,
                    updated: modified ? parseDate(modified) : undefined,
                    content: {
                        html: description,
                        text: content.text(),
                    },
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        },
        { concurrency: 3 }
    );

    const categoryName: string = $(`ul.category li#category_${category}`).text();
    const sortName: string = $(`div.genres_content ul li.${sort}`).text();

    return {
        title: `${$('title').text()} - ${categoryName} - ${sortName}`,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl.href,
        item: items,
        language,
        id: targetUrl.href,
    };
};

export const route: Route = {
    path: '/:category?/:sort?',
    name: '游戏',
    url: 'playzip.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/koyso/0/latest',
    parameters: {
        category: {
            description: '分类，默认为 `0`，即全部，ID 对应下表分类',
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
订阅 [最新动作游戏](https://playzip.com/category/action?sort=latest)，其源网址为 \`https://playzip.com/category/action?sort=latest\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/koyso/3/latest\`](https://playzip.com/category/action?sort=latest)。
:::

#### 分类

| 分类                                                   | ID                                |
| ------------------------------------------------------ | --------------------------------- |
| [全部游戏](https://playzip.com/)                       | [0](https://rsshub.app/koyso/0)   |
| [动作游戏](https://playzip.com/category/action)        | [3](https://rsshub.app/koyso/3)   |
| [冒险游戏](https://playzip.com/category/adventure)     | [5](https://rsshub.app/koyso/5)   |
| [绅士游戏](https://playzip.com/category/r18)           | [7](https://rsshub.app/koyso/7)   |
| [射击游戏](https://playzip.com/category/shooting)      | [1](https://rsshub.app/koyso/1)   |
| [休闲游戏](https://playzip.com/category/casual)        | [2](https://rsshub.app/koyso/2)   |
| [体育竞速](https://playzip.com/category/sports_racing) | [4](https://rsshub.app/koyso/4)   |
| [模拟经营](https://playzip.com/category/simulation)    | [6](https://rsshub.app/koyso/6)   |
| [角色扮演](https://playzip.com/category/rpg)           | [8](https://rsshub.app/koyso/8)   |
| [策略游戏](https://playzip.com/category/strategy)      | [9](https://rsshub.app/koyso/9)   |
| [格斗游戏](https://playzip.com/category/fighting)      | [10](https://rsshub.app/koyso/10) |
| [恐怖游戏](https://playzip.com/category/horror)        | [11](https://rsshub.app/koyso/11) |
| [即时战略](https://playzip.com/category/rts)           | [12](https://rsshub.app/koyso/12) |
| [卡牌游戏](https://playzip.com/category/card)          | [13](https://rsshub.app/koyso/13) |
| [独立游戏](https://playzip.com/category/indie)         | [14](https://rsshub.app/koyso/14) |
| [局域网联机](https://playzip.com/category/lan)         | [15](https://rsshub.app/koyso/15) |

#### 排序

| 排序                                     | ID                                          |
| ---------------------------------------- | ------------------------------------------- |
| [热度](https://playzip.com/?sort=views)  | [views](https://rsshub.app/koyso/0/views)   |
| [最新](https://playzip.com/?sort=latest) | [latest](https://rsshub.app/koyso/0/latest) |`,
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
            title: '全部游戏',
            source: ['koyso.to'],
            target: '/0',
        },
        {
            source: ['playzip.com/'],
            target: '/0',
        },
        {
            title: '动作游戏',
            source: ['koyso.to'],
            target: '/3',
        },
        {
            source: ['playzip.com/category/action'],
            target: '/3',
        },
        {
            title: '冒险游戏',
            source: ['koyso.to'],
            target: '/5',
        },
        {
            source: ['playzip.com/category/adventure'],
            target: '/5',
        },
        {
            title: '绅士游戏',
            source: ['koyso.to'],
            target: '/7',
        },
        {
            source: ['playzip.com/category/r18'],
            target: '/7',
        },
        {
            title: '射击游戏',
            source: ['koyso.to'],
            target: '/1',
        },
        {
            source: ['playzip.com/category/shooting'],
            target: '/1',
        },
        {
            title: '休闲游戏',
            source: ['koyso.to'],
            target: '/2',
        },
        {
            source: ['playzip.com/category/casual'],
            target: '/2',
        },
        {
            title: '体育竞速',
            source: ['koyso.to'],
            target: '/4',
        },
        {
            source: ['playzip.com/category/sports_racing'],
            target: '/4',
        },
        {
            title: '模拟经营',
            source: ['koyso.to'],
            target: '/6',
        },
        {
            source: ['playzip.com/category/simulation'],
            target: '/6',
        },
        {
            title: '角色扮演',
            source: ['koyso.to'],
            target: '/8',
        },
        {
            source: ['playzip.com/category/rpg'],
            target: '/8',
        },
        {
            title: '策略游戏',
            source: ['koyso.to'],
            target: '/9',
        },
        {
            source: ['playzip.com/category/strategy'],
            target: '/9',
        },
        {
            title: '格斗游戏',
            source: ['koyso.to'],
            target: '/10',
        },
        {
            source: ['playzip.com/category/fighting'],
            target: '/10',
        },
        {
            title: '恐怖游戏',
            source: ['koyso.to'],
            target: '/11',
        },
        {
            source: ['playzip.com/category/horror'],
            target: '/11',
        },
        {
            title: '即时战略',
            source: ['koyso.to'],
            target: '/12',
        },
        {
            source: ['playzip.com/category/rts'],
            target: '/12',
        },
        {
            title: '卡牌游戏',
            source: ['koyso.to'],
            target: '/13',
        },
        {
            source: ['playzip.com/category/card'],
            target: '/13',
        },
        {
            title: '独立游戏',
            source: ['koyso.to'],
            target: '/14',
        },
        {
            source: ['playzip.com/category/indie'],
            target: '/14',
        },
        {
            title: '局域网联机',
            source: ['koyso.to'],
            target: '/15',
        },
        {
            source: ['playzip.com/category/lan'],
            target: '/15',
        },
    ],
    view: ViewType.Articles,
};
