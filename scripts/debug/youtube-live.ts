/* eslint-disable no-console */
import { load } from 'cheerio';

import { config } from '@/config';
import cache from '@/utils/cache';
import got from '@/utils/got';

import utils from '../../lib/routes/youtube/utils';

const getChannelInfoFromPage = (html: string) => {
    const $ = load(html);
    const metaChannelId = $('meta[itemprop="identifier"]').attr('content');
    const metaChannelName = $('meta[itemprop="name"]').attr('content');

    let ytChannelId;
    let ytChannelName;

    const ytInitialDataMatch = $('script')
        .text()
        .match(/ytInitialData = ({.*?});/);

    if (ytInitialDataMatch?.[1]) {
        try {
            const ytInitialData = JSON.parse(ytInitialDataMatch[1]) as { metadata?: { channelMetadataRenderer?: { externalId?: string; title?: string } } };
            ytChannelId = ytInitialData.metadata?.channelMetadataRenderer?.externalId;
            ytChannelName = ytInitialData.metadata?.channelMetadataRenderer?.title;
        } catch {
            // Ignore JSON parse errors for debugging output.
        }
    }

    return {
        metaChannelId,
        metaChannelName,
        ytChannelId,
        ytChannelName,
    };
};

const run = async () => {
    const [username] = process.argv.slice(2);

    if (!username) {
        console.error('Usage: pnpm tsx scripts/debug/youtube-live.ts <username>');
        process.exit(1);
    }

    const link = `https://www.youtube.com/${username}`;
    const response = await got(link);
    const { metaChannelId, metaChannelName, ytChannelId, ytChannelName } = getChannelInfoFromPage(response.data);

    console.log('Page meta channelId:', metaChannelId);
    console.log('Page meta channelName:', metaChannelName);
    console.log('ytInitialData channelId:', ytChannelId);
    console.log('ytInitialData channelName:', ytChannelName);

    let channelId = metaChannelId;
    let channelName = metaChannelName;

    if (!channelId) {
        if (config.youtube?.key) {
            const channelResponse = await utils.getChannelWithUsername(username, 'snippet', cache);
            const channelInfo = channelResponse?.data?.items?.[0];
            channelId = channelInfo?.id;
            channelName = channelInfo?.snippet?.title;
        } else {
            console.log('YOUTUBE_KEY is not configured; skipping channels.list(forUsername=...) fallback.');
        }
    }

    console.log('Resolved channelId (original fallback):', channelId);
    console.log('Resolved channelName (original fallback):', channelName);

    if (channelId) {
        const liveResponse = await utils.getLive(channelId, cache);
        const liveItems = liveResponse?.data?.items ?? [];
        console.log('Live items:', liveItems.length);
        if (liveItems[0]) {
            console.log('First live videoId:', liveItems[0].id?.videoId);
        }
    }
};

run().catch((error) => {
    console.error('Error:', error);
    process.exitCode = 1;
});
