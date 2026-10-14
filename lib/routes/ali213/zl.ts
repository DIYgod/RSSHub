import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category } = ctx.req.param();
    const limit = getRouteLimit(ctx, 1);

    const rootUrl = 'https://www.ali213.net';
    const targetUrl: string = new URL(`/news/zl/${category ? (category.endsWith('/') ? category : `${category}/`) : ''}`, rootUrl).href;
    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = ($('html').prop('lang') ?? 'zh') as Language;

    let items: DataItem[] = $('.subscribe-list .subscribe-li')
        .slice(0, limit)
        .toArray()
        .map((element): DataItem => {
            const item = $(element);
            const article = item.find('a.a-title');
            const href = article.attr('href');
            const imageSrc = item.find('a.a-img img').attr('src');
            const title = article.text();
            const description = renderDescription({ intro: item.find('p').text() });
            const link = href ? new URL(href, targetUrl).href : undefined;
            const articleId = link?.match(/\/(\d+)\.html$/)?.[1];
            const guid = articleId ? `ali213-zl-${articleId}` : link;
            const image = imageSrc ? new URL(imageSrc, targetUrl).href : undefined;

            return {
                title,
                description,
                link,
                author: item.find('.subscribe-name').text(),
                guid,
                id: guid,
                content: {
                    html: description,
                    text: item.find('p').text(),
                },
                image,
                banner: image,
                language,
            };
        });

    items = (
        await Promise.all(
            items.map((item) => {
                if (item.link === undefined) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link!);
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

                    description = renderDescription({
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

                    const pubTime = $$('div.newstag_l')
                        .text()
                        .match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)?.[0];

                    return {
                        ...item,
                        title,
                        description,
                        pubDate: pubTime ? timezone(parseDate(pubTime, 'YYYY-MM-DD HH:mm:ss'), 8) : undefined,
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
| [index](https://www.ali213.net/news/zl/) | [game](https://www.ali213.net/news/zl/game/) | [comic](https://www.ali213.net/news/zl/comic/) | [movie](https://www.ali213.net/news/zl/movie/) | [amuse](https://www.ali213.net/news/zl/amuse/) |`,
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
            target: '/zl/:category?',
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
