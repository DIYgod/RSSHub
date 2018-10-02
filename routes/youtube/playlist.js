const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const embed = !ctx.params.embed;

    const playlistTitle = (await utils.getPlaylist(id, 'snippet')).data.items[0].snippet.title;

    const data = (await utils.getPlaylistItems(id, 'snippet,contentDetails')).data.items;

    ctx.state.data = {
        title: `Playlist: ${playlistTitle} by ${data[0].snippet.channelTitle}`,
        link: `https://www.youtube.com/playlist?list=${id}`,
        description: `Playlist: ${playlistTitle} by ${data[0].snippet.channelTitle}`,
        item: data.map((item) => {
            const snippet = item.snippet;
            const videoId = snippet.resourceId.videoId;
            const img = utils.getThumbnail(snippet.thumbnails);
            return {
                title: snippet.title,
                description: `${embed ? '<iframe id="ytplayer" type="text/html" width="640" height="360" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>' : ''}
                ${utils.formatDescription(snippet.description)}<img referrerpolicy="no-referrer" src="${img.url}">`,
                pubDate: new Date(snippet.publishedAt).toUTCString(),
                link: `https://www.youtube.com/watch?v=${videoId}`,
            };
        }),
    };
};
