const utils = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.youtube || !config.youtube.key) {
        throw 'YouTube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }
    const id = ctx.params.id;
    const embed = !ctx.params.embed;

    const playlistTitle = (await utils.getPlaylist(id, 'snippet', ctx.cache)).data.items[0].snippet.title;

    const data = (await utils.getPlaylistItems(id, 'snippet')).data.items.filter((d) => d.snippet.title !== 'Private video' && d.snippet.title !== 'Deleted video');
    const ids = data.map((item) => item.snippet.resourceId.videoId).join(',');
    const authors = (await utils.getVideoAuthor(ids, 'snippet')).data.items;

    ctx.state.data = {
        title: `${playlistTitle} by ${data[0].snippet.channelTitle} - YouTube`,
        link: `https://www.youtube.com/playlist?list=${id}`,
        description: `YouTube playlist ${playlistTitle} by ${data[0].snippet.channelTitle}`,
        item: data.map((item, index) => {
            const snippet = item.snippet;
            const videoId = snippet.resourceId.videoId;
            const img = utils.getThumbnail(snippet.thumbnails);
            return {
                title: snippet.title,
                description: `${
                    embed ? '<iframe id="ytplayer" type="text/html" width="640" height="360" src="https://www.youtube-nocookie.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>' : '<img src="' + img.url + '">'
                }
                ${utils.formatDescription(snippet.description)}`,
                pubDate: new Date(snippet.publishedAt).toUTCString(),
                link: `https://www.youtube.com/watch?v=${videoId}`,
                author: authors[index].snippet.channelTitle,
            };
        }),
    };
};
