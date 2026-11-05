import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/podcasts',
    categories: ['new-media'],
    example: '/supchina/podcasts',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['supchina.com/podcasts', 'supchina.com/'],
        },
        {
            source: ['thechinaproject.com/podcasts', 'thechinaproject.com/'],
            target: '/podcasts',
        },
    ],
    name: 'Podcasts',
    maintainers: ['nczitzk'],
    handler,
    url: 'thechinaproject.com/podcasts',
    description: 'The China Project, formerly SupChina, closed in November 2023. This route provides its official podcast archive. Some archived episodes are no longer available from the audio host.',
};

async function handler(ctx) {
    const rootUrl = 'https://thechinaproject.com';
    const currentUrl = `${rootUrl}/feed/podcast/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data, { xml: true });

    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 50;

    let items = $('item')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                guid: $item.find('guid').text(),
                link: $item.find('link').text(),
                author: $item.find(String.raw`itunes\:author`).text(),
                title: $item.children('title').first().text(),
                pubDate: $item.find('pubDate').text() ? parseDate($item.find('pubDate').text()) : undefined,
                enclosure_url: $item.find('enclosure').attr('url'),
                enclosure_type: $item.find('enclosure').attr('type'),
                itunes_item_image: $item.find(String.raw`itunes\:image`).attr('href'),
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const { sourceTitle, ...detail } = await cache.tryGet(
                `supchina:podcasts:v3:${item.link}`,
                async (): Promise<Pick<DataItem, 'title' | 'description' | 'itunes_item_image' | 'itunes_duration' | 'enclosure_url' | 'enclosure_type'> & { sourceTitle: DataItem['title'] }> => {
                    const episodeUrl = item.enclosure_url?.replace(/\.mp3$/, '');
                    if (!episodeUrl?.startsWith('https://rss.art19.com/episodes/')) {
                        throw new Error(`An archived episode URL was not found: ${item.link}`);
                    }
                    try {
                        const episodeResponse = await got({
                            method: 'get',
                            url: episodeUrl,
                            headers: {
                                accept: 'application/json',
                            },
                        });

                        const data = episodeResponse.data;

                        return {
                            sourceTitle: item.title,
                            title: data.content.episode_title,
                            itunes_item_image: data.content.cover_image,
                            itunes_duration: data.content.duration,
                            enclosure_url: data.content.media.mp3.url,
                            enclosure_type: data.content.media.mp3.content_type,
                            description: data.content.episode_description,
                        };
                    } catch (error) {
                        if (!(error instanceof FetchError) || error.response?.status !== 404) {
                            throw error;
                        }
                        const detailResponse = await got(item.link!);
                        const content = load(detailResponse.data);
                        content('.aspect-spacer, .post-recs, .author-bio, #js-reg-wrap').remove();
                        const description = content('.post__main').html();
                        if (!description) {
                            throw new Error(`Archived episode notes were not found: ${item.link}`, { cause: error });
                        }
                        return { sourceTitle: item.title, title: item.title, description };
                    }
                }
            );
            return { ...item, ...detail, title: sourceTitle === item.title ? (detail.title ?? item.title) : item.title };
        },
        { concurrency: 3 }
    );

    return {
        title: 'SupChina - Podcasts',
        link: `${rootUrl}/podcasts`,
        itunes_author: $(String.raw`channel itunes\:author`)
            .first()
            .text(),
        image: $(String.raw`itunes\:image`).attr('href'),
        item: items,
    };
}
