const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const user = ctx.params.user;

    const default_api_key = 'cc9f13aac2db0b7bb34c27466debea9a'; // from github.com/Maybulb/finale
    const api_key = config.lastfm && config.lastfm.api_key ? config.lastfm.api_key : default_api_key;

    const response = await got(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=${api_key}&format=json`);
    const data = response.data;
    const list = data.recenttracks.track;

    ctx.state.data = {
        title: `Recent Tracks by ${data.recenttracks['@attr'].user} - Last.fm`,
        link: `https://www.last.fm/user/${user}/library`,
        item: list.map((item) => ({
            title: `${item.name} - ${item.artist['#text']}`,
            author: item.artist['#text'],
            description: `<img src="${item.image.slice(-1)[0]['#text']}" />`,
            pubDate: new Date(item.date.uts * 1000),
            link: item.url,
        })),
    };
};
