const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.lastfm || !config.lastfm.api_key) {
        throw 'Last.fm RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }

    const user = ctx.params.user;
    const api_key = config.lastfm.api_key;

    const response = await got(`http://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&user=${user}&api_key=${api_key}&format=json`);
    const data = response.data;
    const list = data.lovedtracks.track;

    ctx.state.data = {
        title: `Loved Tracks by ${data.lovedtracks['@attr'].user} - Last.fm`,
        link: `https://www.last.fm/user/${user}/loved`,
        item: list.map((item) => ({
            title: `${item.name} - ${item.artist.name}`,
            author: item.artist.name,
            description: `<img src="${item.image.slice(-1)[0]['#text']}" />`,
            pubDate: new Date(item.date.uts * 1000),
            link: item.url,
        })),
    };
};
