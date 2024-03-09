import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

// https://github.com/streamlink/streamlink/blob/master/src/streamlink/plugins/twitch.py#L286
const TWITCH_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';

export const route: Route = {
    path: '/live/:login',
    categories: ['live'],
    example: '/twitch/live/riotgames',
    parameters: { login: 'Twitch username' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Live',
    maintainers: ['hoilc'],
    handler,
};

async function handler(ctx) {
    const login = ctx.req.param('login');

    const response = await got({
        method: 'post',
        url: 'https://gql.twitch.tv/gql',
        headers: {
            Referer: 'https://player.twitch.tv',
            'Client-ID': TWITCH_CLIENT_ID,
        },
        json: [
            {
                operationName: 'ChannelShell',
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: 'c3ea5a669ec074a58df5c11ce3c27093fa38534c94286dc14b68a25d5adcbf55',
                    },
                },
                variables: {
                    login,
                    lcpVideosEnabled: false,
                },
            },
            {
                operationName: 'StreamMetadata',
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: '059c4653b788f5bdb2f5a2d2a24b0ddc3831a15079001a3d927556a96fb0517f',
                    },
                },
                variables: {
                    channelLogin: login,
                },
            },
            {
                operationName: 'RealtimeStreamTagList',
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: 'a4747cac9d8e8bf6cf80969f6da6363ca1bdbd80fe136797e71504eb404313fd',
                    },
                },
                variables: {
                    channelLogin: login,
                },
            },
        ],
    });

    const channelShellData = response.data[0].data;
    const streamMetadataData = response.data[1].data;
    const realtimeStreamTagListData = response.data[2].data;

    if (!channelShellData.userOrError.id) {
        throw new Error(channelShellData.userOrError.__typename);
    }

    const displayName = channelShellData.userOrError.displayName;

    const liveItem = [];

    if (streamMetadataData.user.stream) {
        liveItem.push({
            title: streamMetadataData.user.lastBroadcast.title,
            author: displayName,
            category: realtimeStreamTagListData.user.stream.freeformTags.map((item) => item.name),
            description: `<img style="max-width: 100%;" src="https://static-cdn.jtvnw.net/previews-ttv/live_user_${login}.jpg">`,
            pubDate: parseDate(streamMetadataData.user.stream.createdAt),
            guid: streamMetadataData.user.stream.id,
            link: `https://www.twitch.tv/${login}`,
        });
    }

    return {
        title: `Twitch - ${displayName} - Live`,
        link: `https://www.twitch.tv/${login}`,
        item: liveItem,
        allowEmpty: true,
    };
}
