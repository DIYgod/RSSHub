import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { tag } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl = 'https://yuanliao.info';
    const apiUrl: string = new URL('api/discussions', baseUrl).href;
    const targetUrl: string = new URL(tag ? `t/${tag}` : '', baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh';

    const response = await ofetch(apiUrl, {
        query: {
            include: 'user,firstPost,tags',
            'filter[q]': tag ? `tag:${tag}` : '',
            sort: '',
            'page[offset]': '',
        },
    });

    const includedMap = new Map<string, any>();
    for (const item of response.included) {
        includedMap.set(`${item.type}-${item.id}`, item);
    }

    const items: DataItem[] = response.data.slice(0, limit).map((item): DataItem => {
        const attributes = item.attributes;
        const relationships = item.relationships;

        const title: string = attributes.title;

        const firstPostData = relationships?.firstPost?.data;

        const description: string | undefined = firstPostData?.type && firstPostData?.id ? includedMap.get(`${firstPostData.type}-${firstPostData.id}`)?.attributes?.contentHtml : undefined;
        const pubDate: number | string = attributes.createdAt;
        const linkUrl: string | undefined = item.id ? `d/${item.id}` : undefined;
        const categories: string[] = [...new Set(relationships?.tags?.data?.map((tag) => `${tag.type}-${tag.id}`)?.map((key) => includedMap.get(key)?.attributes?.name))].filter(Boolean);

        const userData = relationships?.user?.data;
        const userAttributes = userData && userData.type && userData.id ? includedMap.get(`${userData.type}-${userData.id}`)?.attributes : undefined;

        const authors: DataItem['author'] = userAttributes
            ? [
                  {
                      name: userAttributes.displayName,
                      url: userAttributes.username ? new URL(`u/${userAttributes.username}`, baseUrl).href : undefined,
                      avatar: userAttributes.avatarUrl,
                  },
              ]
            : undefined;
        const guid = `yuanliao-${item.id}`;
        const updated: number | string = attributes.lastPostedAt ?? pubDate;

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
            updated: updated ? parseDate(updated) : undefined,
            language,
        };

        return processedItem;
    });

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img.Header-logo').attr('src'),
        author: $('img.Header-logo').attr('alt'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/:tag?',
    name: '主题',
    url: 'yuanliao.info',
    maintainers: ['nczitzk'],
    handler,
    example: '/yuanliao',
    parameters: {
        tag: {
            description: '标签，默认为全部，可在对应标签页 URL 中找到',
            options: [
                {
                    label: '问题反馈',
                    value: 'bug-report',
                },
                {
                    label: 'Windows',
                    value: 'windows',
                },
                {
                    label: 'macOS',
                    value: 'macos',
                },
                {
                    label: 'Linux',
                    value: 'linux',
                },
                {
                    label: '意见建议',
                    value: 'suggestions',
                },
                {
                    label: '插件发布',
                    value: 'plugins',
                },
                {
                    label: '插件需求',
                    value: 'plugin-needs',
                },
                {
                    label: '开发者',
                    value: 'developers',
                },
            ],
        },
    },
    description: `::: tip
订阅 [问题反馈](https://yuanliao.info/t/bug-report)，其源网址为 \`https://yuanliao.info/t/bug-report\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/yuanliao/bug-report\`](https://rsshub.app/yuanliao/bug-report)。
:::

| 标签                                             | id                                                       |
| ------------------------------------------------ | -------------------------------------------------------- |
| [问题反馈](https://yuanliao.info/t/bug-report)   | [bug-report](https://rsshub.app/yuanliao/bug-report)     |
| [Windows](https://yuanliao.info/t/windows)       | [windows](https://rsshub.app/yuanliao/windows)           |
| [macOS](https://yuanliao.info/t/macos)           | [macos](https://rsshub.app/yuanliao/macos)               |
| [Linux](https://yuanliao.info/t/linux)           | [linux](https://rsshub.app/yuanliao/linux)               |
| [意见建议](https://yuanliao.info/t/suggestions)  | [suggestions](https://rsshub.app/yuanliao/suggestions)   |
| [插件发布](https://yuanliao.info/t/plugins)      | [plugins](https://rsshub.app/yuanliao/plugins)           |
| [插件需求](https://yuanliao.info/t/plugin-needs) | [plugin-needs](https://rsshub.app/yuanliao/plugin-needs) |
| [开发者](https://yuanliao.info/t/developers)     | [developers](https://rsshub.app/yuanliao/developers)     |
`,
    categories: ['bbs'],
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
            source: ['yuanliao.info', 'yuanliao.info/t/:tag'],
            target: (params) => {
                const tag: string = params.tag;

                return `/yuanliao${tag ? `/${tag}` : ''}`;
            },
        },
        {
            title: '问题反馈',
            source: ['yuanliao.info/t/bug-report'],
            target: '/bug-report',
        },
        {
            title: 'Windows',
            source: ['yuanliao.info/t/windows'],
            target: '/windows',
        },
        {
            title: 'macOS',
            source: ['yuanliao.info/t/macos'],
            target: '/macos',
        },
        {
            title: 'Linux',
            source: ['yuanliao.info/t/linux'],
            target: '/linux',
        },
        {
            title: '意见建议',
            source: ['yuanliao.info/t/suggestions'],
            target: '/suggestions',
        },
        {
            title: '插件发布',
            source: ['yuanliao.info/t/plugins'],
            target: '/plugins',
        },
        {
            title: '插件需求',
            source: ['yuanliao.info/t/plugin-needs'],
            target: '/plugin-needs',
        },
        {
            title: '开发者',
            source: ['yuanliao.info/t/developers'],
            target: '/developers',
        },
    ],
    view: ViewType.Articles,
};
