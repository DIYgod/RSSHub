import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

const parseVideoDate = (date: string) => (/^\d{4}-\d{2}-\d{2}/.test(date) ? timezone(parseDate(date), 8) : parseRelativeDate(date));

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 18);

    const baseUrl = 'https://www.dgtle.com';
    const targetUrl: string = new URL('video', baseUrl).href;
    const apiUrl: string = new URL('video/list/1', baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = ($('html').attr('lang') ?? 'zh-CN') as Language;

    const response = await ofetch(apiUrl);

    let items: DataItem[] = response.data.list.slice(0, limit).map((item): DataItem => {
        const title: string = item.title;
        const image: string | undefined = item.cover?.split(/\?/, 1)?.[0];
        const description: string | undefined = renderDescription({
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
                avatar: item.author.avatar_path?.split(/\?/, 1)?.[0],
            },
        ];
        const guid = `dgtle-${item.id}`;

        const processedItem: DataItem = {
            title,
            description,
            link: linkUrl,
            author: authors,
            guid,
            id: guid,
            content: {
                html: description,
                text: item.description,
            },
            image,
            banner: image,
            language,
            itunes_duration: item.duration ? item.duration.split(':').reduce((seconds: number, part: string) => seconds * 60 + Number(part), 0) : undefined,
        };

        return processedItem;
    });

    items = await pMap(
        items,
        (item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('h1.video-title').text();

                const $$enclosureEl: Cheerio<Element> = $$('div.video-play video source').first();
                const enclosureUrl: string | undefined = $$enclosureEl.attr('src');

                const image: string | undefined = $$('div.video-play').attr('data-url');
                const description: string | undefined = renderDescription({
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
                const pubDateStr: string | undefined = $$('p.video-time').text()?.split(/\s/, 1)?.[0];
                const linkUrl: string | undefined = $$('.title').attr('href');
                const categoryEls: Element[] = $$('.category').toArray();
                const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];

                let processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseVideoDate(pubDateStr) : item.pubDate,
                    link: linkUrl ? new URL(linkUrl, baseUrl).href : item.link,
                    category: categories,
                    doi: $$('meta[name="citation_doi"]').attr('content'),
                    content: {
                        html: description,
                        text: $$('h3.video-summary').text(),
                    },
                    image,
                    banner: image,
                    language,
                };

                if (enclosureUrl) {
                    const enclosureType: string = $$enclosureEl.attr('type') || 'video/mp4';

                    processedItem = {
                        ...processedItem,
                        enclosure_url: enclosureUrl,
                        enclosure_type: enclosureType,
                        enclosure_title: title,
                        itunes_duration: item.itunes_duration,
                        itunes_item_image: image,
                    };
                }

                return {
                    ...item,
                    ...processedItem,
                };
            });
        },
        { concurrency: 3 }
    );

    const author: string | undefined = $('meta[name="keywords"]').attr('content')?.split(/,/, 1)[0] ?? undefined;

    return {
        title: $('title').text().trim().split(/\s/, 1)[0],
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
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
