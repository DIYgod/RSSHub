import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import { config } from '@/config';

export const route: Route = {
    path: '/podcast/:id/:region?',
    categories: ['multimedia'],
    example: '/apple/podcast/id1559695855/cn',
    parameters: {
        id: '播客id，可以在 Apple 播客app 内分享的播客的 URL 中找到',
        region: '地區代碼，例如 cn、us、jp，預設為 cn',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['podcasts.apple.com/:region/podcast/:showName/:id', 'podcasts.apple.com/:region/podcast/:id'],
        },
    ],
    name: '播客',
    maintainers: ['Acring'],
    handler,
    url: 'www.apple.com/apple-podcasts/',
};

async function handler(ctx) {
    const { id, region } = ctx.req.param();
    const numericId = id.match(/id(\d+)/)?.[1];
    const baseUrl = 'https://podcasts.apple.com';
    const link = `${baseUrl}/${region || `cn`}/podcast/${id}`;

    const response = await ofetch(link);

    const $ = load(response);

    const serializedServerData = JSON.parse($('#serialized-server-data').text());
    const header = serializedServerData[0].data.shelves.find((item) => item.contentType === 'showHeaderRegular').items[0];

    const bearerToken = await cache.tryGet(
        'apple:podcast:bearer',
        async () => {
            const moduleAddress = new URL($('head script[type="module"]').attr('src'), baseUrl).href;
            const modulesResponse = await ofetch(moduleAddress, {
                parseResponse: (txt) => txt,
            });
            const bearerToken = modulesResponse.match(/="(eyJhbGci.*?)",/)[1];

            return bearerToken as string;
        },
        config.cache.contentExpire,
        false
    );

    const episodeReponse = await ofetch(`https://amp-api.podcasts.apple.com/v1/catalog/us/podcasts/${numericId}/episodes`, {
        query: {
            'extend[podcast-channels]': 'editorialArtwork,subscriptionArtwork,subscriptionOffers',
            include: 'channel',
            limit: 25,
            with: 'entitlements',
            l: 'en-US',
        },
        headers: {
            Authorization: `Bearer ${bearerToken}`,
            Origin: baseUrl,
        },
    });

    const episodes = episodeReponse.data.map(({ attributes: item }) => {
        // Try to keep line breaks in the description
        const offer = item.offers[0];

        return {
            title: item.name,
            enclosure_url: item.assetUrl || offer.hlsUrl,
            enclosure_type: item.assetUrl ? 'audio/mp4' : 'application/vnd.apple.mpegurl',
            itunes_duration: (item.durationInMilliseconds || offer.durationInMilliseconds) / 1000,
            link: item.url,
            pubDate: parseDate(item.releaseDateTime),
            description: item.description.standard.replaceAll('\n', '<br>'),
            author: item.artistName,
            itunes_item_image: item.artwork.url.replace(/\{w\}x\{h\}(?:\{c\}|bb)\.\{f\}/, '3000x3000bb.webp'),
            category: item.genreNames,
        };
    });

    const channel = episodeReponse.data.find((d) => d.type === 'podcast-episodes').relationships.channel.data.find((d) => d.type === 'podcast-channels')?.attributes;

    return {
        title: channel?.name ?? header.title,
        link: channel?.url ?? header.contextAction.podcastOffer.storeUrl,
        itunes_author: header.contextAction.podcastOffer.author,
        item: episodes,
        description: (header.description || channel?.description.standard)?.replaceAll('\n', ' '),
        image: ((channel?.logoArtwork || channel?.subscriptionArtwork)?.url || header.contextAction.podcastOffer.artwork.template).replace(/\{w\}x\{h\}(?:\{c\}|bb)\.\{f\}/, '3000x3000bb.webp'),
        itunes_category: header.metadata.find((d) => Object.hasOwn(d, 'category')).category?.title || header.metadata.find((d) => Object.hasOwn(d, 'category')).category,
    };
}
