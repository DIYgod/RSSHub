import { Route } from '@/types';
import cache from '@/utils/cache';
import utils from './utils';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/playlist/:id/:embed?',
    categories: ['social-media'],
    example: '/youtube/playlist/PLqQ1RwlxOgeLTJ1f3fNMSwhjVgaWKo_9Z',
    parameters: { id: 'YouTube playlist id', embed: 'Default to embed the video, set to any value to disable embedding' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Playlist',
    maintainers: ['HenryQW'],
    handler,
};

async function handler(ctx) {
    if (!config.youtube || !config.youtube.key) {
        throw new Error('YouTube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const id = ctx.req.param('id');
    const embed = !ctx.req.param('embed');

    const playlistTitle = (await utils.getPlaylist(id, 'snippet', cache)).data.items[0].snippet.title;

    const data = (await utils.getPlaylistItems(id, 'snippet', cache)).data.items.filter((d) => d.snippet.title !== 'Private video' && d.snippet.title !== 'Deleted video');

    return {
        title: `${playlistTitle} by ${data[0].snippet.channelTitle} - YouTube`,
        link: `https://www.youtube.com/playlist?list=${id}`,
        description: `YouTube playlist ${playlistTitle} by ${data[0].snippet.channelTitle}`,
        item: data.map((item) => {
            const snippet = item.snippet;
            const videoId = snippet.resourceId.videoId;
            const img = utils.getThumbnail(snippet.thumbnails);
            return {
                title: snippet.title,
                description: utils.renderDescription(embed, videoId, img, utils.formatDescription(snippet.description)),
                pubDate: parseDate(snippet.publishedAt),
                link: `https://www.youtube.com/watch?v=${videoId}`,
                author: snippet.videoOwnerChannelTitle,
            };
        }),
    };
}
