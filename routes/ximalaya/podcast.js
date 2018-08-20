const axios = require('../../utils/axios');
const config = require('../../config');
const baseUrl = 'http://www.ximalaya.com';

module.exports = async (ctx) => {
    const id = ctx.params.id; // 专辑id

    const axios_ins = axios.create({
        headers: {
            'User-Agent': config.ua,
            Host: 'www.ximalaya.com',
            Referer: `${baseUrl}/`,
        },
        responseType: 'json',
    });

    const PlayInfoApi = `${baseUrl}/revision/play/album?albumId=${id}&pageNum=1&sort=1&pageSize=999`; // 声音播放数据
    const PlayInfoResponse = await axios_ins.get(PlayInfoApi);

    const playList = PlayInfoResponse.data.data.tracksAudioPlay;

    const albumurl = baseUrl + playList[0].albumUrl;

    const AlbumInfoApi = `${baseUrl}/revision/album?albumId=${id}`;
    const AlbumInfoResponse = await axios_ins.get(AlbumInfoApi);
    const albuminfo = AlbumInfoResponse.data.data.mainInfo;
    const anchorinfo = AlbumInfoResponse.data.data.anchorInfo;

    const albumtitle = albuminfo.albumTitle;
    const cover_url = albuminfo.cover.split('&')[0];
    const albumdesc = albuminfo.detailRichIntro;
    const author = anchorinfo.anchorName;

    const items = [];

    for (let i = 0; i < playList.length; i++) {
        const track = playList[i];
        const track_id = playList[i].trackId;
        const TrackInfoApi = `${baseUrl}/revision/track/trackPageInfo?trackId=${track_id}`; // TrackInfo

        const item = {
            title: track.trackName,
            link: baseUrl + track.trackUrl,
            description: '',
            pubDate: '',
            enclosure_url: track.src,
            enclosure_length: track.duration,
            enclosure_type: 'audio/mpeg',
        };

        const key = 'podcast' + playList[i].trackId;
        const value = await ctx.cache.get(key);

        if (value) {
            const trackinfo = JSON.parse(value);
            item.description = trackinfo.desc;
            item.pubDate = trackinfo.date;
        } else {
            const TrackInfoResponse = await axios_ins.get(TrackInfoApi);
            const trackinfo_data = TrackInfoResponse.data.data.trackInfo;

            const trackinfo = {
                desc: trackinfo_data.richIntro,
                date: new Date(trackinfo_data.lastUpdate).toUTCString(),
            };

            const trackinfoStr = JSON.stringify(trackinfo);

            item.description = trackinfo.desc;
            item.pubDate = trackinfo.date;

            ctx.cache.set(key, trackinfoStr, 24 * 60 * 60);
        }

        items.push(item);
    }

    ctx.state.data = {
        title: `${albumtitle}`,
        link: `${albumurl}`,
        description: albumdesc,
        image: cover_url,
        itunes_author: author,
        item: items,
    };
};
