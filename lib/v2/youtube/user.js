const utils = require('./utils');
const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    if (!config.youtube || !config.youtube.key) {
        throw Error('YouTube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const username = ctx.params.username;
    const embed = !ctx.params.embed;

    const link = `https://www.youtube.com/${username}`;
    const response = await got(link);
    const $ = cheerio.load(response.data);
    const channelId = $('meta[itemprop="identifier"]').attr('content');
    const channelName = $('meta[itemprop="name"]').attr('content');
    const channelLogo = $('meta[property="og:image"]').attr('content');
    const channelDescription = $('meta[property="og:description"]').attr('content');

    let playlistId;
    if (username.startsWith('@')) {
        playlistId = (await utils.getChannelWithId(channelId, 'contentDetails', ctx.cache)).data.items[0].contentDetails.relatedPlaylists.uploads;
    }
    playlistId = playlistId || (await utils.getChannelWithUsername(username, 'contentDetails', ctx.cache)).data.items[0].contentDetails.relatedPlaylists.uploads;

    const data = (await utils.getPlaylistItems(playlistId, 'snippet', ctx.cache)).data.items;

    ctx.state.data = {
        title: `${channelName || username} - YouTube`,
        logo: channelLogo,
        link: username.startsWith('@') ? `https://www.youtube.com/${username}` : `https://www.youtube.com/user/${username}`,
        description: channelDescription,
        item: data
            .filter((d) => d.snippet.title !== 'Private video' && d.snippet.title !== 'Deleted video')
            .map((item) => {
                const snippet = item.snippet;
                const videoId = snippet.resourceId.videoId;
                const img = utils.getThumbnail(snippet.thumbnails);
                const description = utils.formatDescription(snippet.description);
                return {
                    title: snippet.title,
                    cover: img.url,
                    description: utils.renderDescription(embed, videoId, img, description),
                    pubDate: parseDate(snippet.publishedAt),
                    link: `https://www.youtube.com/watch?v=${videoId}`,
                    author: snippet.videoOwnerChannelTitle,
                    _extra: {
                        intro: description,
                        duration: snippet.duration,
                        iframeUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
                    },
                };
            }),
    };
};
