import path from 'node:path';

import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '18', 10);

    const baseUrl: string = 'https://www.dgtle.com';
    const targetUrl: string = new URL('video', baseUrl).href;
    const apiUrl: string = new URL('video/list/1', baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-CN';

    const response = await ofetch(apiUrl);

    let items: DataItem[] = [];

    items = response.data.list.slice(0, limit).map((item): DataItem => {
        const title: string = item.title;
        const image: string | undefined = item.cover?.split(/\?/)?.[0];
        const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
            images: image
                ? [
                      {
                          src: image,
                          alt: title,
                      },
                  ]
                : undefined,
            intro: item.description,
        });
        const linkUrl: string | undefined = item.url;
        const authors: DataItem['author'] = [
            {
                name: item.author.username,
                url: undefined,
                avatar: item.author.avatar_path?.split(/\?/)?.[0],
            },
        ];
        const guid: string = `dgtle-${item.id}`;

        const processedItem: DataItem = {
            title,
            description,
            link: linkUrl,
            author: authors,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            image,
            banner: image,
            language,
            enclosure_length: item.duration,
        };

        return processedItem;
    });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('h1.video-title').text();

                const $$enclosureEl: Cheerio<Element> = $$('div.video-play video source').first();
                const enclosureUrl: string | undefined = $$enclosureEl.attr('src');

                const image: string | undefined = $$('div.video-play').attr('data-url');
                const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                    videos: enclosureUrl
                        ? [
                              {
                                  src: enclosureUrl,
                                  type: 'video/mp4',
                                  poster: image,
                              },
                          ]
                        : undefined,
                    intro: $$('h3.video-summary').text(),
                });
                const pubDateStr: string | undefined = $$('p.video-time').text()?.split(/\s/)?.[0];
                const linkUrl: string | undefined = $$('.title').attr('href');
                const categoryEls: Element[] = $$('.category').toArray();
                const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
                const authorEls: Element[] = $$('.author').toArray();
                const authors: DataItem['author'] = authorEls.map((authorEl) => {
                    const $$authorEl: Cheerio<Element> = $$(authorEl);

                    return {
                        name: $$authorEl.text(),
                        url: $$authorEl.attr('href'),
                        avatar: $$authorEl.find('img').attr('src'),
                    };
                });
                const guid: string = $$('.id').text();
                const upDatedStr: string | undefined = pubDateStr;

                let processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? timezone(parseRelativeDate(pubDateStr), +8) : item.pubDate,
                    link: linkUrl ? new URL(linkUrl, baseUrl).href : item.link,
                    category: categories,
                    author: authors,
                    doi: $$('meta[name="citation_doi"]').attr('content'),
                    guid,
                    id: guid,
                    content: {
                        html: description,
                        text: description,
                    },
                    image,
                    banner: image,
                    updated: upDatedStr ? timezone(parseRelativeDate(upDatedStr), +8) : item.updated,
                    language,
                };

                if (enclosureUrl) {
                    const enclosureType: string = $$enclosureEl.attr('type') || 'video/mp4';

                    processedItem = {
                        ...processedItem,
                        enclosure_url: enclosureUrl,
                        enclosure_type: enclosureType,
                        enclosure_title: title,
                        enclosure_length: item.enclosure_length,
                        itunes_duration: item.enclosure_length,
                        itunes_item_image: image,
                    };
                }

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    const author: string | undefined = $('meta[name="keywords"]').attr('content')?.split(/,/)[0] ?? undefined;

    return {
        title: $('title').text().trim().split(/\s/)[0],
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author,
        language,
        itunes_author: author,
        itunes_category: 'Technology',
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/video',
    name: '视频',
    url: 'www.dgtle.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/dgtle/video',
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
            source: ['www.dgtle.com/video'],
            target: '/video',
        },
    ],
    view: ViewType.Articles,
};
