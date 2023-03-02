const config = require('@/config').value;
const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');
const asyncPool = require('tiny-async-pool');

module.exports = async (ctx) => {
    if (!config.youtube || !config.youtube.key || !config.youtube.clientId || !config.youtube.clientSecret || !config.youtube.refreshToken) {
        throw 'YouTube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }
    const embed = !ctx.params.embed;

    const channelIds = (await utils.getSubscriptions('snippet', ctx.cache)).data.items.map((item) => item.snippet.resourceId.channelId);

    const playlistIds = [];
    for await (const playlistId of asyncPool(30, channelIds, async (channelId) => (await utils.getChannelWithId(channelId, 'contentDetails', ctx.cache)).data.items[0].contentDetails.relatedPlaylists.uploads)) {
        playlistIds.push(playlistId);
    }

    let items = [];
    for await (const item of asyncPool(30, playlistIds, async (playlistId) => (await utils.getPlaylistItems(playlistId, 'snippet', ctx.cache))?.data.items)) {
        items.push(item);
    }

    // https://measurethat.net/Benchmarks/Show/7223
    // concat > reduce + concat >>> flat
    items = [].concat(...items);

    items = items
        .filter((i) => i && !i.error && i.snippet.title !== 'Private video' && i.snippet.title !== 'Deleted video')
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
        });

    ctx.state.data = {
        title: 'Subscriptions - YouTube',
        description: 'YouTube Subscriptions',
        item: items,
    };

    ctx.state.json = {
        title: 'Subscriptions - YouTube',
        description: 'YouTube Subscriptions',
        channelIds,
        playlistIds,
        item: items,
    };
};
