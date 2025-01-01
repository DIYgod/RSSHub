import path from 'node:path';

import { type CheerioAPI, type Cheerio, type Element, load } from 'cheerio';
import { type Context } from 'hono';

import { type DataItem, type Route, type Data, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import { getCurrentPath } from '@/utils/helpers';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const __dirname = getCurrentPath(import.meta.url);

export const handler = async (ctx: Context): Promise<Data> => {
    const { category } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '1', 10);

    const rootUrl: string = 'https://www.ali213.net';
    const apiRootUrl: string = 'https://mp.ali213.net';
    const targetUrl: string = new URL(`/news/zl/${category ? (category.endsWith('/') ? category : `${category}/`) : ''}`, rootUrl).href;
    const apiUrl: string = new URL('ajax/newslist', apiRootUrl).href;

    const response = await ofetch(apiUrl, {
        query: {
            type: 'new',
        },
    });

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language: string = $('html').prop('lang') ?? 'zh';

    let items: DataItem[] = JSON.parse(response.replace(/^\((.*)\)$/, '$1'))
        .data.slice(0, limit)
        .map((item): DataItem => {
            const title: string = item.Title;
            const description: string = art(path.join(__dirname, 'templates/description.art'), {
                intro: item.GuideRead ?? '',
            });
            const guid: string = `ali213-zl-${item.ID}`;
            const image: string | undefined = item.PicPath ? `https:${item.PicPath}` : undefined;

            const author: DataItem['author'] = item.xiaobian;

            return {
                title,
                description,
                pubDate: parseDate(item.addtime * 1000),
                link: item.url ? `https:${item.url}` : undefined,
                author,
                guid,
                id: guid,
                content: {
                    html: description,
                    text: item.GuideRead ?? '',
                },
                image,
                banner: image,
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
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('h1.newstit').text();

                    let description: string = $$('div#Content').html() ?? '';

                    const pageLinks: string[] = [];
                    $$('a.currpage')
                        .parent()
                        .find('a:not(.currpage)')
                        .each((_, el) => {
                            const href = $$(el).attr('href');
                            if (href) {
                                pageLinks.push(href);
                            }
                        });

                    const pageContents = await Promise.all(
                        pageLinks.map(async (link) => {
                            const response = await ofetch(new URL(link, item.link).href);
                            const $$$: CheerioAPI = load(response);

                            return $$$('div#Content').html() ?? '';
                        })
                    );

                    description += pageContents.join('');

                    description = art(path.join(__dirname, 'templates/description.art'), {
                        description,
                    });

                    const extraLinks = $$('div.extend_read a')
                        .toArray()
                        .map((el) => {
                            const $$el: Cheerio<Element> = $$(el);

                            return {
                                url: $$el.prop('href'),
                                type: 'related',
                                content_html: $$el.text(),
                            };
                        })
                        .filter((_): _ is { url: string; type: string; content_html: string } => true);

                    return {
                        title,
                        description,
                        pubDate: item.pubDate,
                        category: $$('.category')
                            .toArray()
                            .map((c) => $$(c).text()),
                        author: item.author,
                        doi: $$('meta[name="citation_doi"]').prop('content') || undefined,
                        guid: item.guid,
                        id: item.guid,
                        content: {
                            html: description,
                            text: description,
                        },
                        image: item.image,
                        banner: item.image,
                        language,
                        _extra: {
                            links: extraLinks.length > 0 ? extraLinks : undefined,
                        },
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    const title: string = $('title').text();
    const feedImage: string = new URL('news/images/dxhlogo.png', rootUrl).href;

    return {
        title,
        description: $('meta[name="description"]').prop('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: feedImage,
        author: title.split(/_/).pop(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/zl/:category?',
    name: '大侠号',
    url: 'www.ali213.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/ali213/zl',
    parameters: {
        category: '分类，默认为首页，可在对应分类页 URL 中找到',
    },
    description: `::: tip
若订阅 [游戏](https://www.ali213.net/news/zl/game/)，网址为 \`https://www.ali213.net/news/zl/game/\`，请截取 \`https://www.ali213.net/news/zl/\` 到末尾 \`/\` 的部分 \`game\` 作为 \`category\` 参数填入，此时目标路由为 [\`/ali213/zl/game\`](https://rsshub.app/ali213/zl/game)。
:::

| 首页                                     | 游戏                                         | 动漫                                           | 影视                                           | 娱乐                                           |
| ---------------------------------------- | -------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| [index](https://www.ali213.net/news/zl/) | [game](https://www.ali213.net/news/zl/game/) | [comic](https://www.ali213.net/news/zl/comic/) | [movie](https://www.ali213.net/news/zl/movie/) | [amuse](https://www.ali213.net/news/zl/amuse/) |
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
            source: ['www.ali213.net/news/zl/:category'],
            target: (params) => {
                const category = params.category;

                return `/ali213/zl${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '首页',
            source: ['www.ali213.net/news/zl/'],
            target: '/zl',
        },
        {
            title: '游戏',
            source: ['www.ali213.net/news/zl/game/'],
            target: '/zl/game',
        },
        {
            title: '动漫',
            source: ['www.ali213.net/news/zl/comic/'],
            target: '/zl/comic',
        },
        {
            title: '影视',
            source: ['www.ali213.net/news/zl/movie/'],
            target: '/zl/movie',
        },
        {
            title: '娱乐',
            source: ['www.ali213.net/news/zl/amuse/'],
            target: '/zl/amuse',
        },
    ],
    view: ViewType.Articles,
};
