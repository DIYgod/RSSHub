import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import utils from './utils';

export const route: Route = {
    path: '/live/:username/:embed?',
    categories: ['live'],
    example: '/youtube/live/@GawrGura',
    parameters: { username: 'YouTuber id', embed: 'Default to embed the video, set to any value to disable embedding' },
    features: {
        requireConfig: [
            {
                name: 'YOUTUBE_KEY',
                description: 'YouTube API Key (enable YouTube Data API v3), support multiple keys, split them with `,`, [API Key application](https://console.cloud.google.com/apis/library/youtube.googleapis.com)',
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

const getChannelInfoFromPage = ($: CheerioAPI) => {
    const metaChannelId = $('meta[itemprop="identifier"]').attr('content');
    const metaChannelName = $('meta[itemprop="name"]').attr('content');

    if (metaChannelId || metaChannelName) {
        return { channelId: metaChannelId, channelName: metaChannelName };
    }

    const ytInitialDataMatch = $('script')
        .text()
        .match(/ytInitialData = ({.*?});/);
    let ytInitialData: { metadata?: { channelMetadataRenderer?: { externalId?: string; title?: string } } } = {};

    if (ytInitialDataMatch?.[1]) {
        try {
            ytInitialData = JSON.parse(ytInitialDataMatch[1]);
        } catch {
            ytInitialData = {};
        }
    }

    const metadataRenderer = ytInitialData.metadata?.channelMetadataRenderer;

    return {
        channelId: metadataRenderer?.externalId,
        channelName: metadataRenderer?.title,
    };
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
    ({ channelId, channelName } = getChannelInfoFromPage($));

    if (!channelId) {
        if (username.startsWith('@')) {
            throw new NotFoundError(`The channel ${link} does not exist.`);
        }

        const channelResponse = await utils.getChannelWithUsername(username, 'snippet', cache);
        const channelInfo = channelResponse?.data?.items?.[0];

        if (!channelInfo) {
            throw new NotFoundError(`The channel ${link} does not exist.`);
        }

        channelId = channelInfo.id;
        channelName = channelInfo.snippet.title;
    }

    const liveResponse = await utils.getLive(channelId, cache);
    const data = liveResponse?.data?.items ?? [];

    return {
        title: `${channelName || username}'s Live Status`,
        link: `https://www.youtube.com/channel/${channelId}`,
        description: `${channelName || username}'s live streaming status`,
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
                image: img.url,
            };
        }),
        allowEmpty: true,
    };
}
