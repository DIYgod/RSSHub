import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import type { Context } from 'hono';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type ContentElement = {
    type: string;
    content?: string;
    embed?: {
        config?: {
            shorthandScript?: string;
            url?: string;
        };
    };
};
type Story = {
    headlines: {
        basic: string;
    };
    content_elements?: ContentElement[];
    publish_date?: number | string;
    website_url: string;
    taxonomy?: {
        primary_section?: {
            name?: string;
        };
    };
    credits?: {
        by?: Array<{
            name: string;
        }>;
    };
    promo_items?: {
        basic?: {
            url?: string;
        };
    };
    last_updated_date?: number | string;
};
function renderDescription(elements: ContentElement[] | undefined, title: string): Pick<DataItem, 'description' | 'content'> {
    const html = renderToString(
        <>
            {elements?.length
                ? elements.map((element) => {
                      if (element.type === 'text') {
                          return element.content ? <p>{raw(element.content)}</p> : null;
                      }
                      if (element.type === 'raw_html') {
                          return <>{raw(element.content ?? '')}</>;
                      }
                      return null;
                  })
                : null}
        </>
    );
    const $ = load(html, { scriptingEnabled: false }, false);
    $('h1')
        .filter((_, element) => $(element).text() === title)
        .remove();
    $('noscript').each((_, element) => {
        $(element).replaceWith($(element).contents());
    });
    const description = $.html();
    return { description, content: { html: description, text: $.text() } };
}
export async function fetchEmbeddedStory(url: string): Promise<Pick<DataItem, 'description' | 'content'>> {
    const response = await ofetch(url);
    const $ = load(response);
    const article = $('article').first();
    if (!article.length) {
        throw new Error(`Wainao embedded story has no article: ${url}`);
    }
    const hero = copyContent(
        article
            .children('header')
            .find('img[src]')
            .filter((_, element) => !$(element).attr('src')?.startsWith('data:'))
            .first(),
        $
    );
    article.children('header').remove();
    article.find('#StandardFooter, script, style').remove();
    if (hero.length) {
        article.prepend(hero);
    }
    article.find('img, video, source, iframe').each((_, element) => {
        const media = $(element);
        const src = media.attr('data-src') || media.attr('src');
        if (src && !src.startsWith('data:')) {
            media.attr('src', new URL(src, url).href);
        } else if (element.name === 'img') {
            media.remove();
        }
    });
    article.find('[href], [poster]').each((_, element) => {
        const media = $(element);
        for (const attribute of ['href', 'poster']) {
            const value = media.attr(attribute);
            if (value) {
                media.attr(attribute, new URL(value, url).href);
            }
        }
    });
    article.find('[class]').removeAttr('class');
    article.find('[style]').removeAttr('style');
    const description = article.html() || undefined;
    return { description, content: { html: description, text: article.text() } };
}
function parseSourceTime(value: unknown) {
    if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
function parseLimit(value: string | undefined, defaultLimit: number) {
    const limit = Number(value);
    return Number.isFinite(limit) && limit >= 1 ? Math.floor(limit) : defaultLimit;
}
export const handler = async (ctx: Context): Promise<Data> => {
    const { id = 'hotspot' } = ctx.req.param();
    const limit = parseLimit(ctx.req.query('limit'), 30);
    const baseUrl = 'https://www.wainao.me';
    const targetUrl: string = new URL(`topics/${id}`, baseUrl).href;
    const apiUrl: string = new URL('pf/api/v3/content/fetch/story-feed-sections', baseUrl).href;
    const response = await ofetch<{
        content_elements: Story[];
    }>(apiUrl, {
        query: {
            query: JSON.stringify({
                feedOffset: 0,
                feedSize: limit,
                includeSections: `/topics/${id}`,
            }),
            _website: 'wainao',
        },
    });
    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = ($('html').attr('lang') ?? 'zh-CN') as Language;
    const items = await pMap(
        response.content_elements.slice(0, limit),
        async (item): Promise<DataItem> => {
            const title: string = item.headlines.basic;
            const embedded = item.content_elements?.find((element) => element.type === 'custom_embed');
            const embeddedUrl = embedded?.embed?.config?.shorthandScript || embedded?.embed?.config?.url;
            const details = embeddedUrl ? await cache.tryGet<Pick<DataItem, 'description' | 'content'>>(`wainao:embedded-story:${embeddedUrl}`, () => fetchEmbeddedStory(embeddedUrl)) : renderDescription(item.content_elements, title);
            const pubDate = item.publish_date;
            const linkUrl: string | undefined = item.website_url;
            const categories = [item.taxonomy?.primary_section?.name].filter((category): category is string => Boolean(category));
            const authors: DataItem['author'] =
                item.credits?.by?.map((author) => ({
                    name: author.name,
                })) ?? [];
            const guid: string = item.website_url;
            const image = item.promo_items?.basic?.url;
            const updated = item.last_updated_date;
            const processedItem: DataItem = {
                title,
                ...details,
                pubDate: parseSourceTime(pubDate),
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                category: categories,
                author: authors,
                guid,
                id: guid,
                image,
                banner: image,
                updated: parseSourceTime(updated),
                language,
            };
            return processedItem;
        },
        { concurrency: 3 }
    );
    return {
        title: $('title').text(),
        description: $('meta[property="og:title"]').attr('content'),
        link: targetUrl,
        item: items,
        image: $('meta[property="og:image"]').attr('content'),
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: targetUrl,
    };
};
export const route: Route = {
    path: '/topics/:id?',
    name: '主题',
    url: 'wainao.me',
    maintainers: ['shuiRong', 'nczitzk'],
    handler,
    example: '/wainao/topics/hotspot',
    parameters: {
        id: {
            description: '主题 id，默认为 `hotspot`，即热点，可在对应主题页 URL 中找到',
            options: [
                {
                    label: '热点',
                    value: 'hotspot',
                },
                {
                    label: '人物',
                    value: 'people',
                },
                {
                    label: '身份',
                    value: 'identity',
                },
                {
                    label: '政治',
                    value: 'politics',
                },
                {
                    label: '社会',
                    value: 'society',
                },
                {
                    label: '文化',
                    value: 'culture',
                },
                {
                    label: '经济',
                    value: 'economics',
                },
                {
                    label: '环境',
                    value: 'environment',
                },
                {
                    label: 'FUN',
                    value: 'fun',
                },
            ],
        },
    },
    description: `::: tip
若订阅 [人物](https://www.wainao.me/topics/people)，网址为 \`https://www.wainao.me/topics/people\`，请截取 \`https://www.wainao.me/topics/\` 到末尾的部分 \`people\` 作为 \`id\` 参数填入，此时目标路由为 [\`/wainao/topics/people\`](https://rsshub.app/wainao/topics/people)。
:::

| [热点](https://www.wainao.me/topics/hotspot)        | [人物](https://www.wainao.me/topics/people)       | [身份](https://www.wainao.me/topics/identity)         | [政治](https://www.wainao.me/topics/politics)         | [社会](https://www.wainao.me/topics/society)        | [文化](https://www.wainao.me/topics/culture)        | [经济](https://www.wainao.me/topics/economics)          | [环境](https://www.wainao.me/topics/environment)            | [FUN](https://www.wainao.me/topics/fun)     |
| --------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------- |
| [hotspot](https://rsshub.app/wainao/topics/hotspot) | [people](https://rsshub.app/wainao/topics/people) | [identity](https://rsshub.app/wainao/topics/identity) | [politics](https://rsshub.app/wainao/topics/politics) | [society](https://rsshub.app/wainao/topics/society) | [culture](https://rsshub.app/wainao/topics/culture) | [economics](https://rsshub.app/wainao/topics/economics) | [environment](https://rsshub.app/wainao/topics/environment) | [fun](https://rsshub.app/wainao/topics/fun) |`,
    categories: ['new-media'],
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
            source: ['www.wainao.me/topics/:id'],
            target: '/topics/:id',
        },
        {
            title: '热点',
            source: ['www.wainao.me/topics/hotspot'],
            target: '/topics/hotspot',
        },
        {
            title: '人物',
            source: ['www.wainao.me/topics/people'],
            target: '/topics/people',
        },
        {
            title: '身份',
            source: ['www.wainao.me/topics/identity'],
            target: '/topics/identity',
        },
        {
            title: '政治',
            source: ['www.wainao.me/topics/politics'],
            target: '/topics/politics',
        },
        {
            title: '社会',
            source: ['www.wainao.me/topics/society'],
            target: '/topics/society',
        },
        {
            title: '文化',
            source: ['www.wainao.me/topics/culture'],
            target: '/topics/culture',
        },
        {
            title: '经济',
            source: ['www.wainao.me/topics/economics'],
            target: '/topics/economics',
        },
        {
            title: '环境',
            source: ['www.wainao.me/topics/environment'],
            target: '/topics/environment',
        },
        {
            title: 'FUN',
            source: ['www.wainao.me/topics/fun'],
            target: '/topics/fun',
        },
    ],
    view: ViewType.Articles,
};
function copyContent<T extends AnyNode>(selection: Cheerio<T>, $: CheerioAPI): Cheerio<T> {
    const nodes = selection.toArray().map((node) => cloneNode(node, true));
    const root = new Document(nodes);
    for (const node of nodes) {
        node.parent = root;
    }
    return $(nodes);
}
