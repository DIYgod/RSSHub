const utils = require('./utils');

module.exports = async (ctx) => {
    const username = ctx.params.username;
    const embed = !ctx.params.embed;

    const playlistId = (await utils.getChannelWithUsername(username, 'contentDetails')).data.items[0].contentDetails.relatedPlaylists.uploads;

    const data = (await utils.getPlaylistItems(playlistId, 'snippet,contentDetails')).data.items;

    ctx.state.data = {
        title: `${username} 的 Youtube 视频`,
        link: `https://www.youtube.com/user/${username}`,
        description: `${username} 的 Youtube 视频`,
        item: data.map((item) => {
            const snippet = item.snippet;
            const videoId = snippet.resourceId.videoId;
            const img = utils.getThumbnail(snippet.thumbnails);
            return {
                title: snippet.title,
                description: `${embed ? '<iframe id="ytplayer" type="text/html" width="640" height="360" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>' : ''}${utils.formatDescription(
                    snippet.description
                )}<img referrerpolicy="no-referrer" src="${img.url}">`,
                pubDate: new Date(snippet.publishedAt).toUTCString(),
                link: `https://www.youtube.com/watch?v=${videoId}`,
            };
        }),
    };
};
