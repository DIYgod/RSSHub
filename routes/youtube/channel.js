const { google } = require('googleapis');
const config = require('../../config');
const template = require('../../utils/template');

const youtube = google.youtube({
    version: 'v3',
    auth: config.youtube.key
});

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const playlistIdResponst = await youtube.channels.list({
        part: 'contentDetails',
        id: id,
    });
    const playlistId = playlistIdResponst.data.items[0].contentDetails.relatedPlaylists.uploads;

    const responst = await youtube.playlistItems.list({
        part: 'snippet,contentDetails,status',
        playlistId: playlistId
    });
    const data = responst.data.items;

    ctx.body = template({
        title: `${data[0].snippet.channelTitle} 的 Youtube 视频`,
        link: `https://www.youtube.com/channel/${id}`,
        description: `${data[0].snippet.channelTitle} 的 Youtube 视频`,
        item: data.map((item) => {
            const snippet = item.snippet;
            const img = snippet.thumbnails.maxres || snippet.thumbnails.standard || snippet.thumbnails.high || snippet.thumbnails.medium || snippet.thumbnails.default;
            return {
                title: snippet.title,
                description: `${snippet.description}<img referrerpolicy="no-referrer" src="${img.url}">`,
                pubDate: new Date(snippet.publishedAt).toUTCString(),
                link: `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`
            };
        }),
    });
};