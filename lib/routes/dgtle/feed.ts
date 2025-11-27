import path from 'node:path';

import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';
import MarkdownIt from 'markdown-it';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

const md = MarkdownIt({
    html: true,
    linkify: true,
});

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://www.dgtle.com';
    const targetUrl: string = new URL('feed', baseUrl).href;
    const apiUrl: string = new URL('feed/getHotDynamic', baseUrl).href;

    const response = await ofetch(apiUrl, {
        query: {
            last_id: 0,
        },
    });

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = response.data.dataList.slice(0, limit).map((item): DataItem => {
        const content: string = item.content ? md.render(item.content) : '';

        const title: string = $(content).text();
        const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
            images: item.imgs_url.map((src) => ({
                src,
            })),
            description: content,
        });
        const pubDate: number | string = item.created_at;
        const linkUrl: string | undefined = item.url;
        const categories: string[] = [...new Set((item.tags_info?.map((t) => t.title) ?? []).filter(Boolean) as string[])];
        const authors: DataItem['author'] = [
            {
                name: item.user_name,
                url: new URL(`user?uid=${item.encode_uid}`, baseUrl).href,
                avatar: item.avatar_path,
            },
        ];
        const guid: string = `dgtle-${item.id}`;
        const image: string | undefined = item.imgs_url?.[0];
        const updated: number | string = item.updated_at ?? pubDate;

        let processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate, 'X') : undefined,
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
            updated: updated ? parseDate(updated, 'X') : undefined,
            language,
        };

        const medias: Record<string, Record<string, string>> = (() => {
            const acc: Record<string, Record<string, string>> = {};

            for (const media of item.imgs_url) {
                const url: string | undefined = media;

                if (!url) {
                    continue;
                }

                const medium: string = 'image';

                const count: number = Object.values(acc).filter((m) => m.medium === medium).length + 1;
                const key: string = `${medium}${count}`;

                acc[key] = {
                    url,
                    medium,
                    title: '',
                    description: '',
                    thumbnail: url,
                };
            }

            return acc;
        })();

        processedItem = {
            ...processedItem,
            media: medias,
        };

        return processedItem;
    });

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author: $('meta[name="keywords"]').attr('content')?.split(/,/)[0] ?? undefined,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/feed',
    name: '兴趣',
    url: 'www.dgtle.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/dgtle/feed',
    parameters: undefined,
    description: undefined,
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
            source: ['www.dgtle.com/feed'],
            target: '/feed',
        },
    ],
    view: ViewType.Articles,
};
