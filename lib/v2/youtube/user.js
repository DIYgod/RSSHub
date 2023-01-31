const utils = require('./utils');
const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');
// const {ca} = require("@/v2/embassy/supportedList"); //never used
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    if (!config.youtube || !config.youtube.key) {
        throw 'YouTube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }
    const username = ctx.params.username;
    const embed = !ctx.params.embed;

    let playlistId;
    const contentDetails = (await utils.getChannelWithUsername(username, 'contentDetails', ctx.cache)).data;
    if (contentDetails.items) {
        playlistId = contentDetails.items[0].contentDetails.relatedPlaylists.uploads;
    } else {
        try {
            const link = `https://www.youtube.com/@${username}`;
            const response = await got(link);
            const $ = cheerio.load(response.body);
            const channelId = $('meta[itemprop="channelId"]').attr('content');
            playlistId = (await utils.getChannelWithId(channelId, 'contentDetails', ctx.cache)).data.items[0].contentDetails.relatedPlaylists.uploads;
        } catch (e) {
            playlistId = ctx.params.username;
        }
    }

    const data = (await utils.getPlaylistItems(playlistId, 'snippet', ctx.cache)).data.items;

    ctx.state.data = {
        title: `${username} - YouTube`,
        link: `https://www.youtube.com/user/${username}`,
        description: `YouTube user ${username}`,
        item: data
            .filter((d) => d.snippet.title !== 'Private video' && d.snippet.title !== 'Deleted video')
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
            }),
    };
};
