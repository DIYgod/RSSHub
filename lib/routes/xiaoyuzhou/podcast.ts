import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/podcast/:id',
    categories: ['multimedia'],
    view: ViewType.Audios,
    example: '/xiaoyuzhou/podcast/6021f949a789fca4eff4492c',
    parameters: { id: '播客 id 或单集 id，可以在小宇宙播客的 URL 中找到' },
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
            source: ['xiaoyuzhoufm.com/podcast/:id', 'xiaoyuzhoufm.com/episode/:id'],
        },
    ],
    name: '播客',
    maintainers: ['hondajojo', 'jtsang4', 'pseudoyu', 'cscnk52'],
    handler,
    url: 'xiaoyuzhoufm.com/',
};
async function handler(ctx) {
    const id = ctx.req.param('id');
    let link;
    let response;
    let $;
    let pageData;
    // First try podcast URL, if that fails try episode URL
    try {
        link = `https://www.xiaoyuzhoufm.com/podcast/${id}`;
        response = await ofetch(link);
        $ = load(response);
        pageData = JSON.parse($('#__NEXT_DATA__').text());
    } catch (error) {
        // An episode ID may return 404 at the podcast URL. Preserve access and
        // transport errors instead of hiding them behind a second failed request.
        if (!(error instanceof Error) || !('status' in error) || error.status !== 404) {
            throw error;
        }
    }
    if (!pageData?.props?.pageProps?.podcast?.episodes) {
        // Try as episode instead
        link = `https://www.xiaoyuzhoufm.com/episode/${id}`;
        response = await ofetch(link);
        $ = load(response);
        const podcastLink = $('a[href^="/podcast/"].name').attr('href');
        if (podcastLink) {
            const podcastId = podcastLink.split('/').pop();
            link = `https://www.xiaoyuzhoufm.com/podcast/${podcastId}`;
            response = await ofetch(link);
            $ = load(response);
            pageData = JSON.parse($('#__NEXT_DATA__').text());
        }
    }
    if (!pageData?.props?.pageProps?.podcast?.episodes) {
        throw new Error('Xiaoyuzhou did not return podcast data for this podcast or episode ID.');
    }
    const episodes: Array<
        DataItem & {
            link: string;
            eid: string;
        }
    > = pageData.props.pageProps.podcast.episodes.map((item) => {
        const pubDate = !isNullish(item.pubDate) && String(item.pubDate).trim() ? parseDate(item.pubDate) : undefined;
        return {
            title: item.title,
            enclosure_url: item.enclosure.url,
            itunes_duration: item.duration,
            enclosure_type: 'audio/mpeg',
            link: `https://www.xiaoyuzhoufm.com/episode/${item.eid}`,
            eid: item.eid,
            pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
            itunes_item_image: (item.image || item.podcast?.image)?.smallPicUrl,
        };
    });
    const items = await pMap(
        episodes,
        ({ eid, ...item }) =>
            mapResolvedValue(
                cache.tryGet(`xiaoyuzhou:podcast:content:v2:${item.link}`, async () => {
                    const episodeLink = `https://www.xiaoyuzhoufm.com/_next/data/${pageData.buildId}/episode/${eid}.json`;
                    const response = await ofetch(episodeLink);
                    const episodeItem = response.pageProps.episode;
                    return { description: episodeItem.shownotes || episodeItem.description || '' };
                }),
                (detail) => ({ ...item, ...detail })
            ),
        { concurrency: 3, stopOnError: false }
    );
    return {
        title: pageData.props.pageProps.podcast.title,
        link: `https://www.xiaoyuzhoufm.com/podcast/${pageData.props.pageProps.podcast.pid}`,
        itunes_author: pageData.props.pageProps.podcast.author,
        itunes_category: '',
        image: pageData.props.pageProps.podcast.image.smallPicUrl,
        item: items,
        description: pageData.props.pageProps.podcast.description,
    };
}
async function mapResolvedValue<T, U>(promise: Promise<T>, mapper: (value: T) => U | Promise<U>): Promise<U> {
    const value = await promise;
    return mapper(value);
}
function isNullish(value: unknown): value is null | undefined {
    return value === null || value === undefined;
}
