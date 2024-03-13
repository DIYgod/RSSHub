import { Route } from '@/types';
import cache from '@/utils/cache';
import utils from './utils';
import { config } from '@/config';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/c/:username/:embed?',
    radar: {
        source: ['www.youtube.com/c/:id'],
        target: '/c/:id',
    },
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    if (!config.youtube || !config.youtube.key) {
        throw new Error('YouTube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const username = ctx.req.param('username');
    const embed = !ctx.req.param('embed');

    const { data: response } = await got(`https://www.youtube.com/c/${username}`);
    const $ = load(response);
    const ytInitialData = JSON.parse(
        $('script')
            .text()
            .match(/ytInitialData = ({.*?});/)[1]
    );
    const externalId = ytInitialData.metadata.channelMetadataRenderer.externalId;
    const playlistId = (await utils.getChannelWithId(externalId, 'contentDetails', cache)).data.items[0].contentDetails.relatedPlaylists.uploads;

    const data = (await utils.getPlaylistItems(playlistId, 'snippet', cache)).data.items;

    return {
        title: `${username} - YouTube`,
        link: `https://www.youtube.com/c/${username}`,
        description: ytInitialData.metadata.channelMetadataRenderer.description,
        item: data
            .filter((d) => d.snippet.title !== 'Private video' && d.snippet.title !== 'Deleted video')
            .map((item) => {
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
