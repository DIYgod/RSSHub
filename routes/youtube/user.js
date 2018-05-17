const { google } = require('googleapis');
const config = require('../../config');

const youtube = google.youtube({
    version: 'v3',
    auth: config.youtube.key,
});

module.exports = async (ctx) => {
    const username = ctx.params.username;

    const playlistIdResponst = await youtube.channels.list({
        part: 'contentDetails',
        forUsername: username,
    });
    const playlistId = playlistIdResponst.data.items[0].contentDetails.relatedPlaylists.uploads;

    const responst = await youtube.playlistItems.list({
        part: 'snippet,contentDetails,status',
        playlistId: playlistId,
    });
    const data = responst.data.items;

    ctx.state.data = {
        title: `${username} 的 Youtube 视频`,
        link: `https://www.youtube.com/user/${username}`,
        description: `${username} 的 Youtube 视频`,
        item: data.map((item) => {
            const snippet = item.snippet;
            const img = snippet.thumbnails.maxres || snippet.thumbnails.standard || snippet.thumbnails.high || snippet.thumbnails.medium || snippet.thumbnails.default;
            return {
                title: snippet.title,
                description: `${snippet.description}<img referrerpolicy="no-referrer" src="${img.url}">`,
                pubDate: new Date(snippet.publishedAt).toUTCString(),
                link: `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`,
            };
        }),
    };
};
