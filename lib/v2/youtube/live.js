const utils = require('./utils');
const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    if (!config.youtube || !config.youtube.key) {
        throw new Error('YouTube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const username = ctx.params.username;
    const embed = !ctx.params.embed;

    let channelName;
    let channelId;

    const link = `https://www.youtube.com/${username}`;
    const response = await got(link);
    const $ = cheerio.load(response.data);
    channelId = $('meta[itemprop="identifier"]').attr('content');
    channelName = $('meta[itemprop="name"]').attr('content');

    if (!channelId) {
        const channelInfo = (await utils.getChannelWithUsername(username, 'snippet', ctx.cache)).data.items[0];
        channelId = channelInfo.id;
        channelName = channelInfo.snippet.title;
    }

    const data = (await utils.getLive(channelId, ctx.cache)).data.items;

    ctx.state.data = {
        title: `${channelName || username}'s Live Status`,
        link: `https://www.youtube.com/channel/${channelId}`,
        description: `$${channelName || username}'s live streaming status`,
        item: data.map((item) => {
            const snippet = item.snippet;
            const liveVideoId = item.id.videoId;
            const img = utils.getThumbnail(snippet.thumbnails);
            return {
                title: snippet.title,
                description: utils.renderDescription(embed, liveVideoId, img, utils.formatDescription(snippet.description)),
                pubDate: parseDate(snippet.publishedAt),
                guid: liveVideoId,
                link: `https://www.youtube.com/watch?v=${liveVideoId}`,
            };
        }),
        allowEmpty: true,
    };
};
