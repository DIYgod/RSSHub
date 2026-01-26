/* eslint-disable no-console */
type ChannelMetadata = { externalId?: string; title?: string };
type YtInitialData = { metadata?: { channelMetadataRenderer?: ChannelMetadata } };

const extractMetaContent = (html: string, itemprop: string) => {
    const pattern = new RegExp(`<meta[^>]+itemprop="${itemprop}"[^>]+content="([^"]+)"`, 'i');
    const match = html.match(pattern);
    return match?.[1];
};

const extractYtInitialData = (html: string) => {
    const match = html.match(/ytInitialData = ({.*?});/s);
    if (!match?.[1]) {
        return {};
    }
    try {
        return JSON.parse(match[1]) as YtInitialData;
    } catch {
        return {};
    }
};

const fetchJson = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
};

const pickApiKey = () =>
    process.env.YOUTUBE_KEY?.split(',')
        .map((key) => key.trim())
        .filter(Boolean) ?? [];

const fetchWithKeys = async (buildUrl: (key: string) => string) => {
    const keys = pickApiKey();
    if (!keys.length) {
        return null;
    }

    try {
        return await Promise.any(keys.map((key) => fetchJson(buildUrl(key))));
    } catch {
        return null;
    }
};

const getChannelWithUsername = (username: string) => fetchWithKeys((key) => `https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${encodeURIComponent(username)}&key=${key}`);

const getLive = (channelId: string) => fetchWithKeys((key) => `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(channelId)}&eventType=live&type=video&key=${key}`);

const run = async () => {
    const [username] = process.argv.slice(2);

    if (!username) {
        console.error('Usage: node scripts/debug/youtube-live.ts <username>');
        process.exit(1);
    }

    const link = `https://www.youtube.com/${username}`;
    const response = await fetch(link);
    const html = await response.text();

    const metaChannelId = extractMetaContent(html, 'identifier');
    const metaChannelName = extractMetaContent(html, 'name');
    const ytInitialData = extractYtInitialData(html);
    const ytChannelId = ytInitialData.metadata?.channelMetadataRenderer?.externalId;
    const ytChannelName = ytInitialData.metadata?.channelMetadataRenderer?.title;

    console.log('Page meta channelId:', metaChannelId);
    console.log('Page meta channelName:', metaChannelName);
    console.log('ytInitialData channelId:', ytChannelId);
    console.log('ytInitialData channelName:', ytChannelName);

    let channelId = metaChannelId;
    let channelName = metaChannelName;

    if (!channelId) {
        if (pickApiKey().length) {
            const channelResponse = await getChannelWithUsername(username);
            const channelInfo = channelResponse?.items?.[0];
            channelId = channelInfo?.id;
            channelName = channelInfo?.snippet?.title;
        } else {
            console.log('YOUTUBE_KEY is not configured; skipping channels.list(forUsername=...) fallback.');
        }
    }

    console.log('Resolved channelId (original fallback):', channelId);
    console.log('Resolved channelName (original fallback):', channelName);

    if (channelId) {
        const liveResponse = await getLive(channelId);
        const liveItems = liveResponse?.items ?? [];
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
