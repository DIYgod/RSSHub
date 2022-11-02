const utils = require('./utils');
const config = require('@/config').value;
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    if (!config.youtube || !config.youtube.key) {
        throw 'YouTube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }
    const { username } = ctx.params;
    const embed = !ctx.params.embed;

    const { data: response } = await got(`https://www.youtube.com/c/${username}`);
    const $ = cheerio.load(response);
    const ytInitialData = JSON.parse(
        $('script')
            .text()
            .match(/ytInitialData = ({.*?});/)[1]
    );
    const externalId = ytInitialData.metadata.channelMetadataRenderer.externalId;
    const playlistId = (await utils.getChannelWithId(externalId, 'contentDetails', ctx.cache)).data.items[0].contentDetails.relatedPlaylists.uploads;

    const data = (await utils.getPlaylistItems(playlistId, 'snippet', ctx.cache)).data.items;

    ctx.state.data = {
        title: `${username} - YouTube`,
        link: `https://www.youtube.com/c/${username}`,
        description: ytInitialData.metadata.channelMetadataRenderer.description,
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
