import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { parseContent } from './parser';
import { renderDescription } from './templates/description';
import { baseUrl, imageBaseUrl } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL(`users/${id}/talks`, baseUrl).href;
    const apiUrl: string = new URL(`gapi/v1/users/${id}/talks`, baseUrl).href;

    // 获取更多数据以确保过滤后仍有足够的项目
    const fetchLimit = Math.min(limit * 2, 100);

    const query = {
        'page[limit]': fetchLimit,
        sort: '-created-at',
        include: 'user',
    };

    const response = await ofetch(apiUrl, { query });
    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-CN';

    const included = response.included || [];

    // 过滤掉播客和视频类型的动态
    let data = response.data.filter((item) => item.type !== 'radios' && item.type !== 'videos');

    // 限制数量
    data = data.slice(0, limit);

    const items: DataItem[] = data.map((item): DataItem => {
        const attributes = item.attributes;
        const relationships = item.relationships;

        const title: string = attributes.title;
        const pubDate: number | string = attributes['created-at'] || attributes['published-at'];

        const authorObj = relationships?.user?.data;
        const authorIncluded = authorObj ? included.find((i) => i.type === authorObj.type && i.id === authorObj.id) : undefined;
        const authors: DataItem['author'] = authorIncluded
            ? [
                  {
                      name: authorIncluded.attributes?.nickname,
                      url: authorIncluded.id ? new URL(`users/${authorIncluded.id}`, baseUrl).href : undefined,
                      avatar: authorIncluded.thumb ? new URL(authorIncluded.thumb, imageBaseUrl).href : undefined,
                  },
              ]
            : undefined;

        const guid = `gcores-${item.type}-${item.id}`;
        const image: string | undefined = (attributes.cover ?? attributes.thumb) ? new URL(attributes.cover ?? attributes.thumb, imageBaseUrl).href : undefined;

        const description: string = renderDescription({
            images: attributes.cover
                ? [
                      {
                          src: new URL(attributes.cover, imageBaseUrl).href,
                          alt: title,
                      },
                  ]
                : undefined,
            intro: attributes.desc || attributes.excerpt,
            description: attributes.content ? parseContent(JSON.parse(attributes.content)) : undefined,
        });

        return {
            title: title ?? $(description).text(),
            pubDate: pubDate ? parseDate(pubDate) : undefined,
            link: new URL(`${item.type}/${item.id}`, baseUrl).href,
            author: authors,
            guid,
            id: guid,
            image,
            banner: image,
            updated: pubDate ? parseDate(pubDate) : undefined,
            language,
            description,
            content: {
                html: description,
                text: description,
            },
        };
    });

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author: $('title').text().split(/\|/).pop()?.trim(),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/users/:id/talks',
    name: '用户动态',
    url: 'www.gcores.com',
    maintainers: [],
    handler,
    example: '/gcores/users/31418/talks',
    parameters: {
        id: {
            description: '用户 ID，可在用户主页 URL 中找到',
        },
    },
    description: `::: tip
若订阅用户 [这样重这样轻](https://www.gcores.com/users/31418/talks) 的动态，网址为 \`https://www.gcores.com/users/31418/talks\`，请截取 \`https://www.gcores.com/users/\` 到 \`/talks\` 之间的部分 \`31418\` 作为 \`id\` 参数填入，此时目标路由为 [\`/gcores/users/31418/talks\`](https://rsshub.app/gcores/users/31418/talks)。
:::
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
            source: ['www.gcores.com/users/:id/talks'],
            target: '/users/:id/talks',
        },
    ],
    view: ViewType.SocialMedia,
};
