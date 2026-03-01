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

const buildAuthors = (relationships: any, included: any[]): DataItem['author'] => {
    const authorObj = relationships?.user?.data;
    const authorIncluded = authorObj ? included.find((i) => i.type === authorObj.type && i.id === authorObj.id) : undefined;

    return authorIncluded
        ? [
              {
                  name: authorIncluded.attributes?.nickname,
                  url: authorIncluded.id ? new URL(`users/${authorIncluded.id}`, baseUrl).href : undefined,
                  avatar: authorIncluded.thumb ? new URL(authorIncluded.thumb, imageBaseUrl).href : undefined,
              },
          ]
        : undefined;
};

const buildEnclosure = (attributes: any, relationships: any, included: any[], image: string | undefined, title: string | undefined) => {
    const mediaAttrs = included.find((i) => i.id === relationships.media?.data?.id)?.attributes;

    let enclosureUrl: string | undefined;
    let enclosureType: string | undefined;

    if (attributes['speech-path']) {
        enclosureUrl = new URL(`uploads/audio/${attributes['speech-path']}`, 'https://alioss.gcores.com').href;
        enclosureType = `audio/${enclosureUrl?.split(/\./).pop()}`;
    } else if (mediaAttrs && mediaAttrs.audio) {
        enclosureUrl = mediaAttrs.audio;
        enclosureType = `audio/${enclosureUrl?.split(/\./).pop()}`;
    }

    if (!enclosureUrl) {
        return {};
    }

    const enclosureLength: number = attributes.duration ? Number(attributes.duration) : 0;

    return {
        enclosure_url: enclosureUrl,
        enclosure_type: enclosureType,
        enclosure_title: title,
        enclosure_length: enclosureLength,
        itunes_duration: enclosureLength,
        itunes_item_image: image,
    };
};

const buildDescription = (attributes: any, title: string | undefined, enclosureUrl?: string, enclosureType?: string) =>
    renderDescription({
        images: attributes.cover
            ? [
                  {
                      src: new URL(attributes.cover, imageBaseUrl).href,
                      alt: title,
                  },
              ]
            : undefined,
        audios:
            enclosureType?.startsWith('audio') && enclosureUrl
                ? [
                      {
                          src: enclosureUrl,
                          type: enclosureType,
                      },
                  ]
                : undefined,
        intro: attributes.desc || attributes.excerpt,
        description: attributes.content ? parseContent(JSON.parse(attributes.content)) : undefined,
    });

export const handler = async (ctx: Context): Promise<Data> => {
    const { id } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);
    const excludeAlbums: string = ctx.req.query('exclude_albums') ?? '';

    const targetUrl: string = new URL(`users/${id}/content?tab=radios`, baseUrl).href;
    const apiUrl: string = new URL(`gapi/v1/users/${id}/radios`, baseUrl).href;

    // 如果需要排除专辑，获取更多数据以确保过滤后仍有足够的项目
    const fetchLimit = excludeAlbums ? Math.min(limit * 3, 100) : limit;

    const query = {
        'page[limit]': fetchLimit,
        sort: '-published-at',
        include: excludeAlbums ? 'user,media,albums' : 'user,media',
    };

    const response = await ofetch(apiUrl, { query });
    let data = response.data;

    // 如果需要排除专辑，先过滤
    if (excludeAlbums) {
        const excludeAlbumIds = new Set(excludeAlbums.split(',').map((aid) => aid.trim()));
        data = data.filter((item) => {
            const albumsData = item.relationships?.albums?.data || [];
            // 如果这个播客不属于任何一个要排除的专辑，就保留
            return !albumsData.some((album) => excludeAlbumIds.has(album.id));
        });
    }

    // 限制数量
    data = data.slice(0, limit);

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-CN';

    const included = response.included || [];

    // 处理每个播客项目
    const items: DataItem[] = data.map((item): DataItem => {
        const attributes = item.attributes;
        const relationships = item.relationships;

        const title = attributes.title;
        const pubDate: number | string = attributes['published-at'];
        const linkUrl = new URL(`radios/${item.id}`, baseUrl).href;
        const image: string | undefined = (attributes.cover ?? attributes.thumb) ? new URL(attributes.cover ?? attributes.thumb, imageBaseUrl).href : undefined;
        const authors = buildAuthors(relationships, included);
        const enclosure = buildEnclosure(attributes, relationships, included, image, title);
        const description = buildDescription(attributes, title, enclosure.enclosure_url, enclosure.enclosure_type);

        return {
            title: title ?? $(description).text(),
            pubDate: pubDate ? parseDate(pubDate) : undefined,
            link: linkUrl,
            author: authors,
            guid: `gcores-${item.id}`,
            id: `gcores-${item.id}`,
            image,
            banner: image,
            updated: pubDate ? parseDate(pubDate) : undefined,
            language,
            description,
            content: {
                html: description,
                text: description,
            },
            ...enclosure,
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
    path: '/users/:id/radios',
    name: '用户播客',
    url: 'www.gcores.com',
    maintainers: [],
    handler,
    example: '/gcores/users/31418/radios',
    parameters: {
        id: {
            description: '用户 ID，可在用户主页 URL 中找到',
        },
        exclude_albums: {
            description: '要排除的专辑 ID，多个用逗号分隔，可在专辑页面 URL 中找到',
            default: '',
        },
    },
    description: `::: tip
若订阅用户 [这样重这样轻](https://www.gcores.com/users/31418) 发布的播客，网址为 \`https://www.gcores.com/users/31418\`，请截取 \`https://www.gcores.com/users/\` 之后的部分 \`31418\` 作为 \`id\` 参数填入，此时目标路由为 [\`/gcores/users/31418/radios\`](https://rsshub.app/gcores/users/31418/radios)。

若要排除特定专辑的播客，可以添加 \`exclude_albums\` 参数。例如排除蜉蝣天地（专辑 ID 为 332），路由为 \`/gcores/users/31418/radios?exclude_albums=332\`。支持排除多个专辑，用逗号分隔，如 \`?exclude_albums=332,123\`。
:::
`,
    categories: ['game'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.gcores.com/users/:id/content', 'www.gcores.com/users/:id'],
            target: '/gcores/users/:id/radios',
        },
    ],
    view: ViewType.Audios,
};
