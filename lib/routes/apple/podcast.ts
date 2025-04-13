import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

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
            source: ['podcasts.apple.com/:region/podcast/:id'],
        },
    ],
    name: '播客',
    maintainers: ['Acring'],
    handler,
    url: 'www.apple.com/apple-podcasts/',
};

async function handler(ctx) {
    const { id, region } = ctx.req.param();
    const link = `https://podcasts.apple.com/${region || `cn`}/podcast/${id}`;
    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = load(response.data);

    const schemaShow = JSON.parse($(String.raw`#schema\:show`).text());
    const serializedServerData = JSON.parse($('#serialized-server-data').text());

    const seoEpisodes = schemaShow.workExample;
    const originEpisodes = serializedServerData[0].data.shelves.find((item) => item.contentType === 'episode').items;
    const header = serializedServerData[0].data.shelves.find((item) => item.contentType === 'showHeaderRegular').items[0];

    const episodes = originEpisodes.map((item) => {
        // Try to keep line breaks in the description
        const matchedSeoEpisode = seoEpisodes.find((seoEpisode) => seoEpisode.name === item.title) || null;
        const episodeDescription = (matchedSeoEpisode ? matchedSeoEpisode.description : item.summary).replaceAll('\n', '<br>');

        return {
            title: item.title,
            enclosure_url: item.playAction.episodeOffer.streamUrl,
            enclosure_type: 'audio/mp4',
            itunes_duration: item.duration,
            link: item.playAction.episodeOffer.storeUrl,
            pubDate: parseDate(item.releaseDate),
            description: episodeDescription,
        };
    });

    return {
        title: header.title,
        link: header.contextAction.podcastOffer.storeUrl,
        itunes_author: header.contextAction.podcastOffer.author,
        item: episodes,
        description: header.description.replaceAll('\n', ' '),
    };
}
