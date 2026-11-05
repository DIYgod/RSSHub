import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

// https://github.com/streamlink/streamlink/blob/master/src/streamlink/plugins/twitch.py#L286
const TWITCH_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';
const streamScheduleQuery =
    'query StreamSchedule($login: String!, $startAt: Time!, $endAt: Time!, $startingWeekday: String, $utcOffsetMinutes: Int) { currentUser { id login } user(login: $login) { id primaryColorHex lastBroadcast { id startedAt } broadcastSettings { id title } stream { id createdAt viewersCount previewImageURL(width: 320, height: 180) verticalPreviewImageURL: previewImageURL(height: 320, width: 180) height width isDualFormat game { id slug name } } videos(first: 30, type: ARCHIVE, sort: TIME, options: { searchRangeStartAt: $startAt, searchRangeEndAt: $endAt }) { edges { node { id title createdAt lengthSeconds viewCount previewThumbnailURL(width: 320, height: 180) game { id slug name } } } } channel { id schedule { id nextSegment { id startAt } interruption { startAt endAt reason } segments(startingWeekday: $startingWeekday, utcOffsetMinutes: $utcOffsetMinutes, relativeDate: $startAt) { id baseSegmentID title startAt endAt isCancelled cancelledUntil hasReminder repeatEndsAfterCount categories { id slug name boxArtURL(width: 144, height: 192) } } } } } }';

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

function getPublicationDate(value: string | undefined) {
    if (typeof value !== 'string' || !value) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

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
                query: streamScheduleQuery,
            },
        ],
    });

    const errors = response.data.flatMap((item) => item.errors ?? []);
    if (errors.length) {
        throw new Error(`Twitch schedule API returned an error: ${errors.map((error) => error.message).join('; ')}`);
    }
    const channelShellData = response.data[0].data;
    const streamScheduleData = response.data[1].data;

    if (!channelShellData || !streamScheduleData) {
        throw new Error('Twitch schedule API returned no channel or schedule data');
    }
    if (!streamScheduleData.user?.id) {
        throw new InvalidParameterError('Username does not exist');
    }

    const displayName = channelShellData.userOrError.displayName;

    // schedule segments may be null
    const out = (streamScheduleData.user.channel.schedule?.segments ?? []).map((item) => ({
        title: item.title,
        guid: item.id,
        link: `https://www.twitch.tv/${login}`,
        author: displayName,
        description: `EndAt: ${item.endAt}`,
        pubDate: getPublicationDate(item.startAt),
        category: item.categories.map((item) => item.name),
    }));

    return {
        title: `Twitch - ${displayName} - Schedule`,
        link: `https://www.twitch.tv/${login}`,
        item: out,
        allowEmpty: true,
    };
}
