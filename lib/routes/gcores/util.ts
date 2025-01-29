import { type Data, type DataItem } from '@/types';

import { art } from '@/utils/render';
import { getCurrentPath } from '@/utils/helpers';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { type CheerioAPI, load } from 'cheerio';
import path from 'node:path';

const __dirname = getCurrentPath(import.meta.url);

import { parseContent } from './parser';

const baseUrl: string = 'https://www.gcores.com';
const imageBaseUrl: string = 'https://image.gcores.com';
const audioBaseUrl: string = 'https://alioss.gcores.com';

const baseQuery = {
    sort: '-published-at',
    include: 'category,user,media',
    'filter[list-all]': 1,
    'filter[is-news]': 1,
};

const processItems = async (limit: number, query: any, apiUrl: string, targetUrl: string): Promise<Data> => {
    const response = await ofetch(apiUrl, {
        query: {
            ...baseQuery,
            query,
        },
    });

    const included = response.included;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = response.data?.slice(0, limit).map((item): DataItem => {
        const attributes = item.attributes;
        const relationships = item.relationships;

        const title: string = attributes.title;
        const pubDate: number | string = attributes['published-at'];
        const linkUrl: string | undefined = `${item.type}/${item.id}`;

        const categoryObj = relationships?.category?.data;
        const categories: string[] = categoryObj ? [included.find((i) => i.type === categoryObj.type && i.id === categoryObj.id)?.attributes?.name].filter(Boolean) : [];

        const authorObj = relationships?.user?.data;
        const authorIncluded = included.find((i) => i.type === authorObj.type && i.id === authorObj.id);
        const authors: DataItem['author'] = authorIncluded
            ? [
                  {
                      name: authorIncluded.attributes?.nickname,
                      url: authorIncluded.id ? new URL(`${authorObj.type}/${authorIncluded.id}`, baseUrl).href : undefined,
                      avatar: authorIncluded.thumb ? new URL(authorIncluded.thumb, imageBaseUrl).href : undefined,
                  },
              ]
            : undefined;

        const guid: string = `gcores-${item.id}`;
        const image: string | undefined = (attributes.cover ?? attributes.thumb) ? new URL(attributes.cover ?? attributes.thumb, imageBaseUrl).href : undefined;
        const updated: number | string = pubDate;

        let processedItem: DataItem = {
            title,
            pubDate: pubDate ? parseDate(pubDate) : undefined,
            link: linkUrl,
            category: categories,
            author: authors,
            guid,
            id: guid,
            image,
            banner: image,
            updated: updated ? parseDate(updated) : undefined,
            language,
        };

        let enclosureUrl: string | undefined;
        let enclosureType: string | undefined;

        const mediaAttrs = included.find((i) => i.id === relationships.media?.data?.id)?.attributes;

        if (attributes['speech-path']) {
            enclosureUrl = new URL(`uploads/audio/${attributes['speech-path']}`, audioBaseUrl).href;
            enclosureType = `audio/${enclosureUrl?.split(/\./).pop()}`;
        } else if (mediaAttrs) {
            if (mediaAttrs.audio) {
                enclosureUrl = mediaAttrs.audio;
                enclosureType = `audio/${enclosureUrl?.split(/\./).pop()}`;
            } else if (mediaAttrs['original-src']) {
                enclosureUrl = mediaAttrs['original-src'];
                enclosureType = 'video/mpeg';
            }
        }

        if (enclosureUrl) {
            const enclosureLength: number = attributes.duration ? Number(attributes.duration) : 0;

            processedItem = {
                ...processedItem,
                enclosure_url: enclosureUrl,
                enclosure_type: enclosureType,
                enclosure_title: title,
                enclosure_length: enclosureLength,
                itunes_duration: enclosureLength,
                itunes_item_image: image,
            };
        }

        const description: string = art(path.join(__dirname, 'templates/description.art'), {
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
            videos:
                enclosureType?.startsWith('video') && enclosureUrl
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

        processedItem = {
            ...processedItem,
            description,
            content: {
                html: description,
                text: description,
            },
        };

        return processedItem;
    });

    const title: string = $('title').text();

    return {
        title,
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author: title.split(/\|/).pop()?.trim(),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export { baseUrl, imageBaseUrl, audioBaseUrl, processItems };
