import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';
import path from 'node:path';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id = 'hotspot' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://www.wainao.me';
    const targetUrl: string = new URL(`topics/${id}`, baseUrl).href;
    const apiUrl: string = new URL('pf/api/v3/content/fetch/story-feed-sections', baseUrl).href;

    const response = await ofetch(apiUrl, {
        query: {
            query: JSON.stringify({
                feedOffset: 0,
                feedSize: limit,
                includeSections: `/topics/${id}`,
            }),
            d: 81,
            _website: 'wainao',
        },
    });

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = response.content_elements
        .slice(0, limit)
        .map((item): DataItem => {
            const title: string = item.headlines.basic;
            const description: string = art(path.join(__dirname, 'templates/description.art'), {
                elements: item.content_elements,
            });
            const pubDate: number | string = item.publish_date;
            const linkUrl: string | undefined = item.website_url;
            const categories: string[] = [item.taxonomy?.primary_section?.name].filter(Boolean);
            const authors: DataItem['author'] =
                item.credits?.by?.map((author) => ({
                    name: author.name,
                })) ?? [];
            const guid: string = item.website_url;
            const image: string | undefined = item.promo_items.basic.url;
            const updated: number | string = item.last_updated_date;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDate ? parseDate(pubDate) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
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
                updated: updated ? parseDate(updated) : undefined,
                language,
            };

            return processedItem;
        })
        .filter((_): _ is DataItem => true);

    return {
        title: $('title').text(),
        description: $('meta[property="og:title"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
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
    maintainers: ['nczitzk'],
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
| [hotspot](https://rsshub.app/wainao/topics/hotspot) | [people](https://rsshub.app/wainao/topics/people) | [identity](https://rsshub.app/wainao/topics/identity) | [politics](https://rsshub.app/wainao/topics/politics) | [society](https://rsshub.app/wainao/topics/society) | [culture](https://rsshub.app/wainao/topics/culture) | [economics](https://rsshub.app/wainao/topics/economics) | [environment](https://rsshub.app/wainao/topics/environment) | [fun](https://rsshub.app/wainao/topics/fun) |
`,
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
