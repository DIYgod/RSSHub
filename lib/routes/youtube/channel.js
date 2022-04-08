const utils = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.youtube || !config.youtube.key) {
        throw 'YouTube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }
    const id = ctx.params.id;
    const embed = !ctx.params.embed;

    const playlistId = (await utils.getChannelWithId(id, 'contentDetails', ctx.cache)).data.items[0].contentDetails.relatedPlaylists.uploads;

    const data = (await utils.getPlaylistItems(playlistId, 'snippet,contentDetails')).data.items;

    ctx.state.data = {
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
                    description: `${
                        embed ? '<iframe id="ytplayer" type="text/html" width="640" height="360" src="https://www.youtube-nocookie.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>' : '<img src="' + img.url + '">'
                    }${utils.formatDescription(snippet.description)}`,
                    pubDate: new Date(snippet.publishedAt).toUTCString(),
                    link: `https://www.youtube.com/watch?v=${videoId}`,
                };
            }),
    };
};
