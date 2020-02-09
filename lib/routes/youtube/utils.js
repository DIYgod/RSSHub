const { google } = require('googleapis');
const config = require('@/config').value;

const youtube = google.youtube({
    version: 'v3',
    auth: config.youtube.key,
});

const youtubeUtils = {
    getPlaylistItems: async (id, part) => {
        const res = await youtube.playlistItems.list({
            part,
            playlistId: id,
        });
        return res;
    },
    getPlaylist: async (id, part, cache) =>
        await cache.tryGet('getPlaylist' + id, async () => {
            const res = await youtube.playlists.list({
                part,
                id: id,
            });
            return res;
        }),
    getChannelWithId: async (id, part, cache) =>
        await cache.tryGet('getChannelWithId' + id, async () => {
            const res = await youtube.channels.list({
                part,
                id: id,
            });
            return res;
        }),
    getChannelWithUsername: async (username, part, cache) =>
        await cache.tryGet('getPlaylist' + username, async () => {
            const res = await youtube.channels.list({
                part,
                forUsername: username,
            });
            return res;
        }),
    getThumbnail: (thumbnails) => thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium || thumbnails.default,
    formatDescription: (description) => description.replace(/(?:\r\n|\r|\n)/g, '<br>'),
};

module.exports = youtubeUtils;
