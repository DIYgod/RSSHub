const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

// https://github.com/streamlink/streamlink/blob/master/src/streamlink/plugins/twitch.py#L286
const TWITCH_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';

const FILTER_CURSOR_MAP = {
    archive: 0,
    highlights: 1,
    all: 2,
};

module.exports = async (ctx) => {
    const { login, filter = 'all' } = ctx.params;

    const response = await got({
        method: 'post',
        url: 'https://gql.twitch.tv/gql',
        headers: {
            Referer: 'https://player.twitch.tv',
            'Client-ID': TWITCH_CLIENT_ID,
        },
        json: [
            {
                operationName: 'ChannelVideoShelvesQuery',
                variables: {
                    channelLogin: login,
                    first: 5,
                },
                extensions: {
                    persistedQuery: {
                        version: 1,
                        sha256Hash: '7b31d8ae7274b79d169a504e3727baaaed0d5ede101f4a38fc44f34d76827903',
                    },
                },
            },
        ],
    });

    const channelVideoShelvesQueryData = response.data[0].data;

    if (!channelVideoShelvesQueryData.user.id) {
        throw Error(`Username does not exist`);
    }

    const displayName = channelVideoShelvesQueryData.user.displayName;

    const videoShelvesEdge = channelVideoShelvesQueryData.user.videoShelves.edges[FILTER_CURSOR_MAP[filter] || FILTER_CURSOR_MAP.all];

    const out = videoShelvesEdge.node.items.map((item) => ({
        title: item.title,
        link: `https://www.twitch.tv/videos/${item.id}`,
        author: displayName,
        pubDate: parseDate(item.publishedAt),
        description: `<img style="max-width: 100%;" src="${item.previewThumbnailURL}"><br/><img style="max-width: 100%;" src="${item.animatedPreviewURL}">`,
        category: [item.game.displayName],
    }));

    ctx.state.data = {
        title: `Twitch - ${displayName} - ${videoShelvesEdge.node.title}`,
        link: `https://www.twitch.tv/${login}`,
        item: out,
    };
};
