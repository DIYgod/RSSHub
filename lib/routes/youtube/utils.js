const { google } = require('googleapis');
const config = require('@/config').value;

let count = 0;
const youtube = {};
if (config.youtube.key) {
    const keys = config.youtube.key.split(',');

    keys.forEach((key, index) => {
        if (key) {
            youtube[index] = google.youtube({
                version: 'v3',
                auth: key,
            });
            count = index + 1;
        }
    });
}

let index = -1;
const exec = async (func) => {
    let result;
    for (let i = 0; i < count; i++) {
        index++;
        try {
            // eslint-disable-next-line no-await-in-loop
            result = await func(youtube[index % count]);
            break;
        } catch (error) {
            // console.error(error);
        }
    }
    return result;
};

const youtubeUtils = {
    getPlaylistItems: async (id, part) => {
        const res = await exec(
            async (youtube) =>
                await youtube.playlistItems.list({
                    part,
                    playlistId: id,
                    maxResults: 50, // youtube api param value default is 5
                })
        );
        return res;
    },
    getPlaylist: async (id, part, cache) =>
        await cache.tryGet('getPlaylist' + id, async () => {
            const res = await exec(
                async (youtube) =>
                    await youtube.playlists.list({
                        part,
                        id: id,
                    })
            );
            return res;
        }),
    getChannelWithId: async (id, part, cache) =>
        await cache.tryGet('getChannelWithId' + id, async () => {
            const res = await exec(
                async (youtube) =>
                    await youtube.channels.list({
                        part,
                        id: id,
                    })
            );
            return res;
        }),
    getChannelWithUsername: async (username, part, cache) =>
        await cache.tryGet('getPlaylist' + username, async () => {
            const res = await exec(
                async (youtube) =>
                    await youtube.channels.list({
                        part,
                        forUsername: username,
                    })
            );
            return res;
        }),
    getVideoAuthor: async (id, part) => {
        const res = await exec(
            async (youtube) =>
                await youtube.videos.list({
                    part,
                    id,
                })
        );
        return res;
    },
    getThumbnail: (thumbnails) => thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium || thumbnails.default,
    formatDescription: (description) => description.replace(/(?:\r\n|\r|\n)/g, '<br>'),
};

module.exports = youtubeUtils;
