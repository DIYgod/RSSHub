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

    const playlistTitle = (await utils.getPlaylist(id, 'snippet', cache)).data.items[0].snippet.title;

    const data = (await utils.getPlaylistItems(id, 'snippet', cache)).data.items.filter((d) => d.snippet.title !== 'Private video' && d.snippet.title !== 'Deleted video');

    ctx.set('data', {
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
    });
};
