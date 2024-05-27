import { Route } from '@/types';
import cache from '@/utils/cache';
import utils from './utils';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { load } from 'cheerio';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/live/:username/:embed?',
    categories: ['live'],
    example: '/youtube/live/@GawrGura',
    parameters: { username: 'YouTuber id', embed: 'Default to embed the video, set to any value to disable embedding' },
    features: {
        requireConfig: [
            {
                name: 'YOUTUBE_KEY',
                description: ' YouTube API Key, support multiple keys, split them with `,`, [API Key application](https://console.developers.google.com/)',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Live',
    maintainers: ['sussurr127'],
    handler,
};

async function handler(ctx) {
    if (!config.youtube || !config.youtube.key) {
        throw new ConfigNotFoundError('YouTube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const username = ctx.req.param('username');
    const embed = !ctx.req.param('embed');

    let channelName;
    let channelId;

    const link = `https://www.youtube.com/${username}`;
    const response = await got(link);
    const $ = load(response.data);
    channelId = $('meta[itemprop="identifier"]').attr('content');
    channelName = $('meta[itemprop="name"]').attr('content');

    if (!channelId) {
        const channelInfo = (await utils.getChannelWithUsername(username, 'snippet', cache)).data.items[0];
        channelId = channelInfo.id;
        channelName = channelInfo.snippet.title;
    }

    const data = (await utils.getLive(channelId, cache)).data.items;

    return {
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
}
