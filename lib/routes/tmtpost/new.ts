import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import { getCurrentPath } from '@/utils/helpers';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';
import path from 'node:path';

const __dirname = getCurrentPath(import.meta.url);

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '1', 10);

    const baseUrl: string = 'https://www.tmtpost.com';
    const apiBaseUrl: string = 'https://api.tmtpost.com';
    const targetUrl: string = new URL('new', baseUrl).href;
    const listApiUrl: string = new URL('v1/lists/new', apiBaseUrl).href;
    const postApiUrl: string = new URL('v1/posts/', apiBaseUrl).href;

    const headers = {
        'app-version': 'web1.0',
    };

    const response = await ofetch(listApiUrl, {
        query: {
            limit,
        },
        headers,
    });

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = response.data.slice(0, limit).map((item): DataItem => {
        const title: string = item.title;
        const description: string = art(path.join(__dirname, 'templates/description.art'), {
            intro: item.summary,
        });
        const pubDate: number | string = item.time_published;
        const linkUrl: string | undefined = item.share_link;
        const guid: string = item.guid;
        const image: string | undefined = item.thumb_image?.original?.url;
        const updated: number | string = item.updated ?? pubDate;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate, 'X') : undefined,
            link: linkUrl,
            guid,
            id: guid,
            content: {
                html: description,
                text: item.content ?? description,
            },
            image,
            banner: image,
            updated: updated ? parseDate(updated, 'X') : undefined,
            language,
        };

        return processedItem;
    });

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const apiUrl: string = new URL(item.guid as string, postApiUrl).href;

                    const detailResponse = await ofetch(apiUrl, {
                        query: {
                            fields: ['authors', 'tags', 'featured_image', 'categories', 'stock_list', 'big_plate', 'concept_plate', 'plate', 'plate_list', 'share_link'].join(';'),
                        },
                        headers,
                    });
                    const data = detailResponse.data;

                    if (!data) {
                        return item;
                    }

                    const title: string = data.title;
                    const description: string = art(path.join(__dirname, 'templates/description.art'), {
                        intro: data.summary,
                        description: data.main,
                    });
                    const pubDate: number | string = data.time_published;
                    const linkUrl: string | undefined = data.share_link;
                    const categories: string[] = [
                        ...new Set(
                            (
                                [...(data.categories ?? []), ...(data.stock_list ?? []), ...(data.big_plate ?? []), ...(data.concept_plate ?? []), ...(data.plate ?? []), ...(data.plate_list ?? []), ...(data.tags ?? [])].map(
                                    (c) => c.title ?? c.name ?? c.tag
                                ) as string[]
                            ).filter(Boolean)
                        ),
                    ];
                    const authors: DataItem['author'] = data.authors?.map((author) => ({
                        name: author.username,
                        url: new URL(`user/${author.guid}`, baseUrl).href,
                        avatar: author.avatar,
                    }));
                    const guid: string = `tmtpost-${data.post_guid}`;
                    const image: string | undefined = data.images?.[0]?.url;
                    const updated: number | string = data.time_updated;

                    let processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDate ? parseDate(pubDate, 'X') : undefined,
                        link: linkUrl ?? item.link,
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

                    const enclosureUrl: string | undefined = data.audio;

                    if (enclosureUrl) {
                        const enclosureType: string = `audio/${enclosureUrl.split(/\./).pop()}`;
                        const itunesDuration: string | number | undefined = data.duration;

                        processedItem = {
                            ...processedItem,
                            enclosure_url: enclosureUrl,
                            enclosure_type: enclosureType,
                            enclosure_title: title,
                            enclosure_length: undefined,
                            itunes_duration: itunesDuration,
                            itunes_item_image: image,
                        };
                    }

                    const medias: Record<string, Record<string, string>> = {};

                    if (data.full_size_images ?? data.images) {
                        const images = data.full_size_images ?? data.images;
                        for (const media of images) {
                            const url: string | undefined = media.url ?? media;

                            if (!url) {
                                continue;
                            }

                            const medium: string = 'image';
                            const count: number = Object.values(medias).filter((m) => m.medium === medium).length + 1;
                            const key: string = `${medium}${count}`;

                            medias[key] = {
                                url,
                                medium,
                                title,
                                thumbnail: media.thumbnail ?? url,
                            };
                        }
                    }

                    processedItem = {
                        ...processedItem,
                        media: medias,
                    };

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    const title: string = $('title').text();
    const author: string | undefined = title.split(/-/).pop();

    return {
        title,
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author: title.split(/-/).pop(),
        language,
        itunes_author: author,
        itunes_category: 'Technology',
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/new',
    name: '最新',
    url: 'www.tmtpost.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/tmtpost/new',
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
            source: ['www.tmtpost.com'],
            target: '/new',
        },
    ],
    view: ViewType.Articles,
};
