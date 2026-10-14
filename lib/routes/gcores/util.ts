import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import { getMimeType, mimes } from 'hono/utils/mime';

import type { Data, DataItem, Language } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { parseContent } from './parser';
import { renderDescription } from './templates/description';

const baseUrl = 'https://www.gcores.com';
const imageBaseUrl = 'https://image.gcores.com';
const audioBaseUrl = 'https://alioss.gcores.com';
const audioMimes = { ...mimes, m4a: 'audio/mp4', mp4: 'audio/mp4' };

const getAudioMimeType = (url: string): string | undefined => {
    const type = getMimeType(new URL(url).pathname, audioMimes);
    return type?.startsWith('audio/') ? type : undefined;
};

const types = new Set<string>(['radios', 'articles', 'news', 'videos', 'talks']);
const wrapperTypes = new Set(['program-previews', 'talk-original-recommendations']);

const getPrimaryContent = (data: any[], included: any[]): any[] => {
    const records = new Map(included.map((item) => [`${item.type}:${item.id}`, item]));
    const seen = new Set<string>();

    return data
        .flatMap((item) => {
            if (types.has(item.type)) {
                return [item];
            }
            if (wrapperTypes.has(item.type)) {
                const reference = item.relationships?.[item.attributes?.['content-key']]?.data;
                const content = reference && records.get(`${reference.type}:${reference.id}`);
                return content && types.has(content.type) ? [content] : [];
            }
            return [];
        })
        .filter((item) => {
            const key = `${item.type}:${item.id}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
};

const processItems = async (limit: number, query: any, apiUrl: string, targetUrl: string): Promise<Data> => {
    const response = await ofetch(apiUrl, {
        query: query ?? {
            'page[limit]': limit,
            sort: '-published-at',
            include: 'category,user,media',
            'filter[list-all]': 1,
        },
    });

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = ($('html').attr('lang') ?? 'zh-CN') as Language;

    const included = response.included ?? [];
    const data = getPrimaryContent(response.data, included);

    const items: DataItem[] = data?.slice(0, limit).map((item): DataItem => {
        const attributes = item.attributes;
        const relationships = item.relationships ?? {};

        const title: string = attributes.title;
        const pubDate: number | string = attributes['published-at'];
        const linkUrl: string | undefined = `${item.type}/${item.id}`;

        const categoryObjs = [relationships?.category?.data, relationships?.tag?.data, relationships?.topic?.data].filter(Boolean);
        const categories: string[] = categoryObjs
            .map((obj) => {
                const attributes = included.find((i) => i.type === obj.type && i.id === obj.id)?.attributes;
                return attributes?.name ?? attributes?.title;
            })
            .filter(Boolean);

        const authorObj = relationships?.user?.data;
        const authorIncluded = authorObj ? included.find((i) => i.type === authorObj.type && i.id === authorObj.id) : undefined;
        const authors: DataItem['author'] = authorIncluded
            ? [
                  {
                      name: authorIncluded.attributes?.nickname,
                      url: authorIncluded.id ? new URL(`${authorObj.type}/${authorIncluded.id}`, baseUrl).href : undefined,
                      avatar: authorIncluded.attributes?.thumb ? new URL(authorIncluded.attributes.thumb, imageBaseUrl).href : undefined,
                  },
              ]
            : undefined;

        const guid = `gcores-${item.type}-${item.id}`;
        const image: string | undefined = (attributes.cover ?? attributes.thumb) ? new URL(attributes.cover ?? attributes.thumb, imageBaseUrl).href : undefined;
        const updated: number | string | undefined = attributes['author-modified-at'] ?? attributes['updated-at'];

        let processedItem: DataItem = {
            title,
            pubDate: pubDate ? parseDate(pubDate) : undefined,
            link: new URL(linkUrl, baseUrl).href,
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
        let videoUrl: string | undefined;
        let videoType: string | undefined;
        let videoEmbed = false;

        const mediaObj = relationships.media?.data;
        const mediaAttrs = mediaObj ? included.find((i) => i.type === mediaObj.type && i.id === mediaObj.id)?.attributes : undefined;

        if (attributes['speech-path']) {
            enclosureUrl = new URL(`uploads/audio/${attributes['speech-path']}`, audioBaseUrl).href;
            enclosureType = getAudioMimeType(enclosureUrl);
        } else if (mediaAttrs) {
            if (mediaAttrs.audio) {
                enclosureUrl = new URL(mediaAttrs.audio, `${audioBaseUrl}/uploads/audio/`).href;
                enclosureType = getAudioMimeType(enclosureUrl);
            } else if (mediaAttrs['original-src']) {
                videoUrl = new URL(mediaAttrs['original-src'], baseUrl).href;
                videoEmbed = mediaAttrs['media-type'] === 'taptap';
                const type = getMimeType(new URL(videoUrl).pathname);
                videoType = type?.startsWith('video/') ? type : undefined;
                if (!videoEmbed && videoType) {
                    enclosureUrl = videoUrl;
                    enclosureType = videoType;
                }
            }
        }

        if (enclosureUrl) {
            const duration: number = attributes.duration ? Number(attributes.duration) : 0;

            processedItem = {
                ...processedItem,
                enclosure_url: enclosureUrl,
                enclosure_type: enclosureType,
                enclosure_title: title,
                itunes_duration: duration,
                itunes_item_image: image,
            };
        }

        const description: string = renderDescription({
            images:
                attributes.cover && !(videoUrl && !videoEmbed && videoType)
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
                videoUrl && (videoEmbed || videoType)
                    ? [
                          {
                              src: videoUrl,
                              type: videoType,
                              embed: videoEmbed,
                              poster: image,
                          },
                      ]
                    : undefined,
            intro: attributes.desc || attributes.excerpt,
            description: attributes.content ? parseContent(JSON.parse(attributes.content)) : undefined,
        });

        processedItem = {
            ...processedItem,
            title: title ?? $(description).text(),
            description,
            content: {
                html: description,
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
        author: title.split(/\|/).pop()?.trim(),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export { audioBaseUrl, baseUrl, getAudioMimeType, imageBaseUrl, processItems };
