const utils = require('./utils');
const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');
const got = require('../../utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    if (!config.youtube || !config.youtube.key) {
        throw Error('YouTube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const id = ctx.params.id;
    const embed = !ctx.params.embed;

    if (!utils.isYouTubeChannelId(id)) {
        throw Error(`Invalid YouTube channel ID. \nYou may want to use <code>/youtube/user/:id</code> instead.`);
    }

    const channelLink = `https://www.youtube.com/channel/${id}`;
    const response = await got(channelLink);
    const $ = cheerio.load(response.data);
    const channelLogo = $('meta[property="og:image"]').attr('content');
    const channelDescription = $('meta[property="og:description"]').attr('content');

    const playlistId = (await utils.getChannelWithId(id, 'contentDetails', ctx.cache)).data.items[0].contentDetails.relatedPlaylists.uploads;

    const data = (await utils.getPlaylistItems(playlistId, 'snippet', ctx.cache)).data.items;

    ctx.state.data = {
        title: `${data[0].snippet.channelTitle} - YouTube`,
        link: channelLink,
        logo: channelLogo,
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
