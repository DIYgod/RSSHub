import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const bakeTimestamp = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

export const route: Route = {
    path: '/:channel?',
    radar: [
        {
            source: ['www.transcriptforest.com/en/channel'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.transcriptforest.com/en/channel',
};

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const rootUrl = 'https://www.transcriptforest.com';

    const { data: firstResponse } = await got(rootUrl);

    const data = JSON.parse(firstResponse.match(/({"props".*"scriptLoader":\[]})<\/script>/)?.[1]);

    const buildId = data.buildId;
    const defaultLocale = data.defaultLocale;
    const channels = data.props.pageProps.listChannel;
    const selected = channel ? channels.find((c) => c.channel_id === channel || c.channel_name === channel) : undefined;

    const apiUrl = new URL(`_next/data/${buildId}/en${selected ? `/channel/${selected.channel_id}` : ''}.json`, rootUrl).href;
    const currentUrl = new URL(selected ? `${defaultLocale}/channel/${selected.channel_id}` : '', rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            channelName: selected ? selected.channel_id : '',
            offset: 0,
        },
    });

    let items = response.pageProps.listEpisode.data.slice(0, limit).map((item) => ({
        title: item.episode_name,
        link: new URL(`${defaultLocale}/${item.channel_id}/${item.episode_id}`, rootUrl).href,
        detailUrl: new URL(`_next/data/${buildId}/${defaultLocale}/${item.channel_id}/${item.episode_id}.json`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            texts: item.episode_description.split(/\n\n/).map((text) => ({
                text,
            })),
        }),
        author: item.channel_name,
        guid: item.id,
        pubDate: parseDate(item.published_at),
        updated: parseDate(item.updated_at),
        itunes_item_image: item.episode_cover.split(/\?/)[0],
        itunes_duration: item.episode_duration,
        enclosure_url: item.source_media,
        enclosure_type: 'audio/mpeg',
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.detailUrl);
                const { data: textResponse } = await got(detailResponse.pageProps.currentEpisode.ps4_url);

                item.description =
                    art(path.join(__dirname, 'templates/description.art'), {
                        audios: [
                            {
                                src: detailResponse.pageProps.currentEpisode.media,
                                type: 'audio/mpeg',
                            },
                        ],
                    }) +
                    item.description +
                    art(path.join(__dirname, 'templates/description.art'), {
                        texts: textResponse.map((t) => ({
                            startTime: bakeTimestamp(t.startTime),
                            endTime: bakeTimestamp(t.endTime),
                            text: t.readOnlyText,
                        })),
                    });

                delete item.detailUrl;

                return item;
            })
        )
    );

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const title = $('title').text();
    const image = $('meta[property="og:image"]').prop('content');
    const icon = new URL($('link[rel="apple-touch-icon"]').prop('href'), rootUrl).href;
    const author = title.split(/\|/)[0].trim();

    return {
        item: items,
        title,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        icon,
        logo: icon,
        author,
        itunes_author: author,
        allowEmpty: true,
    };
}
