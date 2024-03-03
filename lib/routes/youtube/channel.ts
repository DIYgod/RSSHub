// @ts-nocheck
import cache from '@/utils/cache';
const utils = require('./utils');
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    if (!config.youtube || !config.youtube.key) {
        throw new Error('YouTube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const id = ctx.req.param('id');
    const embed = !ctx.req.param('embed');

    if (!utils.isYouTubeChannelId(id)) {
        throw new Error(`Invalid YouTube channel ID. \nYou may want to use <code>/youtube/user/:id</code> instead.`);
    }

    const playlistId = (await utils.getChannelWithId(id, 'contentDetails', cache)).data.items[0].contentDetails.relatedPlaylists.uploads;

    const data = (await utils.getPlaylistItems(playlistId, 'snippet', cache)).data.items;

    ctx.set('data', {
        title: `${data[0].snippet.channelTitle} - YouTube`,
        link: `https://www.youtube.com/channel/${id}`,
        description: `YouTube channel ${data[0].snippet.channelTitle}`,
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
    });
};
