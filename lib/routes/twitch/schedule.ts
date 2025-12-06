import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';

// https://github.com/streamlink/streamlink/blob/master/src/streamlink/plugins/twitch.py#L286
const TWITCH_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';

export const route: Route = {
    path: '/schedule/:login',
    categories: ['live'],
    example: '/twitch/schedule/riotgames',
    parameters: { login: 'Twitch username' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.twitch.tv/:login/schedule'],
        },
    ],
    name: 'Stream Schedule',
    maintainers: ['hoilc'],
    handler,
};

async function handler(ctx) {
    const login = ctx.req.param('login');

    const today = new Date();
    const oneWeekLater = new Date(today.getTime() + 86_400_000 * 7);
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
                operationName: 'StreamSchedule',
                variables: {
                    login,
                    startingWeekday: 'MONDAY',
                    utcOffsetMinutes: 480,
                    startAt: today.toISOString(),
                    endAt: oneWeekLater.toISOString(),
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: '01925339777a81111ffac469430bc4ea4773c18a3c1642f1b231e61e2278ea41',
                    },
                },
            },
        ],
    });

    const channelShellData = response.data[0].data;
    const streamScheduleData = response.data[1].data;

    if (!streamScheduleData.user.id) {
        throw new InvalidParameterError(`Username does not exist`);
    }

    const displayName = channelShellData.userOrError.displayName;

    // schedule segments may be null
    const out = streamScheduleData.user.channel.schedule.segments?.map((item) => ({
        title: item.title,
        guid: item.id,
        link: `https://www.twitch.tv/${login}`,
        author: displayName,
        description: `StartAt: ${item.startAt}</br>EndAt: ${item.endAt}`,
        category: item.categories.map((item) => item.name),
    }));

    return {
        title: `Twitch - ${displayName} - Schedule`,
        link: `https://www.twitch.tv/${login}`,
        item: out,
        allowEmpty: true,
    };
}
