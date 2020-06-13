const { google } = require('googleapis');
const config = require('@/config').value;

let getYoutube = () => null;
if (config.youtube.key) {
    const keys = config.youtube.key.split(',');
    const youtube = {};
    let count = 0;
    let index = -1;

    keys.forEach((key, index) => {
        if (key) {
            youtube[index] = google.youtube({
                version: 'v3',
                auth: key,
            });
            count = index + 1;
        }
    });

    getYoutube = () => {
        index++;
        return youtube[index % count];
    };
}

const youtubeUtils = {
    getPlaylistItems: async (id, part) => {
        const res = await getYoutube().playlistItems.list({
            part,
            playlistId: id,
            maxResults: 50, // youtube api param value default is 5
        });
        return res;
    },
    getPlaylist: async (id, part, cache) =>
        await cache.tryGet('getPlaylist' + id, async () => {
            const res = await getYoutube().playlists.list({
                part,
                id: id,
            });
            return res;
        }),
    getChannelWithId: async (id, part, cache) =>
        await cache.tryGet('getChannelWithId' + id, async () => {
            const res = await getYoutube().channels.list({
                part,
                id: id,
            });
            return res;
        }),
    getChannelWithUsername: async (username, part, cache) =>
        await cache.tryGet('getPlaylist' + username, async () => {
            const res = await getYoutube().channels.list({
                part,
                forUsername: username,
            });
            return res;
        }),
    getThumbnail: (thumbnails) => thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium || thumbnails.default,
    formatDescription: (description) => description.replace(/(?:\r\n|\r|\n)/g, '<br>'),
};

module.exports = youtubeUtils;
