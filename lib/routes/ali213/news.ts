import path from 'node:path';

import { type CheerioAPI, type Cheerio, type Element, load } from 'cheerio';
import { type Context } from 'hono';

import { type DataItem, type Route, type Data, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import { getCurrentPath } from '@/utils/helpers';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const __dirname = getCurrentPath(import.meta.url);

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'new' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const rootUrl: string = 'https://www.ali213.net';
    const targetUrl: string = new URL(`news/${category.endsWith('/') ? category : `${category}/`}`, rootUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language: string = $('html').prop('lang') ?? 'zh-CN';

    let items: DataItem[] = $('div.n_lone')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item: Cheerio<Element> = $(item);

            const aEl: Cheerio<Element> = $item.find('h2.lone_t a');

            const title: string = aEl.prop('title') || aEl.text();
            const link: string | undefined = aEl.prop('href');

            const imageEl: Cheerio<Element> = $item.find('img');
            const imageSrc: string | undefined = imageEl?.prop('src');
            const imageAlt: string | undefined = imageEl?.prop('alt');

            const intro: string = $item.find('div.lone_f_r_t').text();

            const description: string = art(path.join(__dirname, 'templates/description.art'), {
                images: imageEl
                    ? [
                          {
                              src: imageSrc,
                              alt: imageAlt,
                          },
                      ]
                    : undefined,
                intro,
            });

            const author: DataItem['author'] = $item.find('div.lone_f_r_f span').last().text().split(/：/).pop();

            return {
                title,
                description,
                pubDate: parseDate($item.find('div.lone_f_r_f span').first().text()),
                link,
                author,
                content: {
                    html: description,
                    text: $item.find('div.lone_f_r_t').text(),
                },
                image: imageSrc,
                banner: imageSrc,
                language,
            };
        });

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link && typeof item.link !== 'string') {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    try {
                        const detailResponse = await ofetch(item.link);
                        const $$: CheerioAPI = load(detailResponse);

                        const title: string = $$('h1.newstit').text();
                        const image: string | undefined = $$('div#Content img').first().prop('src');

                        const mediaContent: Cheerio<Element> = $$('div#Content p span img');
                        const media: Record<string, Record<string, string>> = {};

                        if (mediaContent.length) {
                            mediaContent.each((_, el) => {
                                const $$el: Cheerio<Element> = $$(el);

                                const pEl: Cheerio<Element> = $$el.closest('p');

                                const mediaUrl: string | undefined = $$el.prop('src');
                                const mediaType: string | undefined = mediaUrl?.split(/\./).pop();

                                if (mediaType && mediaUrl) {
                                    media[mediaType] = { url: mediaUrl };

                                    pEl.replaceWith(
                                        art(path.join(__dirname, 'templates/description.art'), {
                                            images: [
                                                {
                                                    src: mediaUrl,
                                                },
                                            ],
                                        })
                                    );
                                }
                            });
                        }

                        const description: string = art(path.join(__dirname, 'templates/description.art'), {
                            description: $$('div#Content').html() ?? '',
                        });

                        const extraLinks = $$('div.extend_read ul li a')
                            .toArray()
                            .map((el) => {
                                const $$el: Cheerio<Element> = $$(el);

                                return {
                                    url: $$el.prop('href'),
                                    type: 'related',
                                    content_html: $$el.prop('title') || $$el.text(),
                                };
                            })
                            .filter((_): _ is { url: string; type: string; content_html: string } => true);

                        return {
                            title,
                            description,
                            pubDate: timezone(parseDate($$('div.newstag_l').text().split(/\s/)[0]), +8),
                            author: item.author,
                            content: {
                                html: description,
                                text: $$('div#Content').html() ?? '',
                            },
                            image,
                            banner: image,
                            language,
                            media: Object.keys(media).length > 0 ? media : undefined,
                            _extra: {
                                links: extraLinks.length > 0 ? extraLinks : undefined,
                            },
                        };
                    } catch {
                        return item;
                    }
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    const author = '游侠网';
    const title = $('div.news-list-title').text();
    const feedImage = new URL('news/images/ali213_app_big.png', rootUrl).href;

    return {
        title: `${author} - ${title}`,
        description: title,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: feedImage,
        author,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/news/:category?',
    name: '资讯',
    url: 'www.ali213.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/ali213/news/new',
    parameters: {
        category: '分类，默认为 `new`，即最新资讯，可在对应分类页 URL 中找到',
    },
    description: `:::tip
若订阅 [游戏资讯](https://www.ali213.net/news/game/)，网址为 \`https://www.ali213.net/news/game/\`，请截取 \`https://www.ali213.net/news/\` 到末尾 \`/\` 的部分 \`game\` 作为 \`category\` 参数填入，此时目标路由为 [\`/ali213/news/game\`](https://rsshub.app/ali213/news/game)。
:::

| 分类名称 | 分类 ID |
| -------- | ------- |
| 最新资讯 | new     |
| 评测     | pingce  |
| 游戏     | game    |
| 动漫     | comic   |
| 影视     | movie   |
| 科技     | tech    |
| 电竞     | esports |
| 娱乐     | amuse   |
| 手游     | mobile  |
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
    },
    radar: [
        {
            source: ['www.ali213.net/news/:category'],
            target: (params) => {
                const category = params.category;

                return `/news/${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '最新资讯',
            source: ['www.ali213.net/news/new'],
            target: '/news/new',
        },
        {
            title: '评测',
            source: ['www.ali213.net/news/pingce'],
            target: '/news/pingce',
        },
        {
            title: '游戏',
            source: ['www.ali213.net/news/game'],
            target: '/news/game',
        },
        {
            title: '动漫',
            source: ['www.ali213.net/news/comic'],
            target: '/news/comic',
        },
        {
            title: '影视',
            source: ['www.ali213.net/news/movie'],
            target: '/news/movie',
        },
        {
            title: '科技',
            source: ['www.ali213.net/news/tech'],
            target: '/news/tech',
        },
        {
            title: '电竞',
            source: ['www.ali213.net/news/esports'],
            target: '/news/esports',
        },
        {
            title: '娱乐',
            source: ['www.ali213.net/news/amuse'],
            target: '/news/amuse',
        },
        {
            title: '手游',
            source: ['www.ali213.net/news/mobile'],
            target: '/news/mobile',
        },
    ],
    view: ViewType.Articles,
};
