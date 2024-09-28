import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/podcast/:id',
    categories: ['multimedia'],
    example: '/apple/podcast/id1559695855',
    parameters: { id: '播客id，可以在 Apple 播客app 内分享的播客的 URL 中找到' },
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
            source: ['podcasts.apple.com/cn/podcast/:id'],
        },
    ],
    name: '播客',
    maintainers: ['Acring'],
    handler,
    url: 'www.apple.com.cn/apple-podcasts/',
};

async function handler(ctx) {
    const link = `https://podcasts.apple.com/cn/podcast/${ctx.req.param('id')}`;
    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = load(response.data);

    const page_data = JSON.parse($('#serialized-server-data').text());

    const seo_episodes = page_data[0].data.seoData.schemaContent.workExample;
    const origin_episodes = page_data[0].data.shelves.find((item) => item.contentType === 'episode').items;
    const header = page_data[0].data.shelves.find((item) => item.contentType === 'showHeaderRegular').items[0];

    const episodes = origin_episodes.map((item) => {
        // Try to keep line breaks in the description
        const matched_seo_episode = seo_episodes.find((seo_episode) => seo_episode.name === item.title) || null;
        const episode_description = (matched_seo_episode ? matched_seo_episode.description : item.summary).replaceAll('\n', '<br>');

        return {
            title: item.title,
            enclosure_url: item.playAction.episodeOffer.streamUrl,
            enclosure_type: 'audio/mp4',
            itunes_duration: item.duration,
            link: item.playAction.episodeOffer.storeUrl,
            pubDate: parseDate(item.releaseDate),
            description: episode_description,
        };
    });

    return {
        title: header.title,
        link: header.contextAction.podcastOffer.storeUrl,
        itunes_author: header.contextAction.podcastOffer.author,
        item: episodes,
        description: header.description.replaceAll('\n', '<br>'),
    };
}
