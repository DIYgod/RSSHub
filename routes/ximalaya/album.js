const axios = require('../../utils/axios');
const config = require('../../config');
const baseUrl = 'http://www.ximalaya.com';

module.exports = async (ctx) => {
    const id = ctx.params.id; // 专辑id
    let count = ctx.params.count ? ctx.params.count : 10; // 请求数量
    if (count > 100) {
        count = 100;
    } else if (count < 1) {
        count = 1;
    }

    const axios_ins = axios.create({
        headers: {
            'User-Agent': config.ua,
            Host: 'www.ximalaya.com',
        },
        responseType: 'json',
    });

    const PlayInfoApi = `${baseUrl}/revision/play/album?albumId=${id}&pageNum=1&sort=1&pageSize=${count}`; // 声音播放数据
    const PlayInfoResponse = await axios_ins.get(PlayInfoApi);

    const playList = PlayInfoResponse.data.data.tracksAudioPlay;

    const albumurl = baseUrl + playList[0].albumUrl;

    const AlbumInfoApi = `${baseUrl}/revision/album?albumId=${id}`;
    const AlbumInfoResponse = await axios_ins.get(AlbumInfoApi);

    const albuminfo = AlbumInfoResponse.data.data.mainInfo;
    const albumtitle = albuminfo.albumTitle;
    const cover_url = albuminfo.cover.split('&')[0];
    const albumdesc = albuminfo.detailRichIntro;
    const author = AlbumInfoResponse.data.data.anchorInfo.anchorName;

    const resultItems = await Promise.all(
        playList.map(async (item) => {
            const resultItem = {
                title: item.trackName,
                link: baseUrl + item.trackUrl,
                description: '',
                pubDate: '',
                itunes_item_image: item.trackCoverPath.split('&')[0],
                enclosure_url: item.src,
                enclosure_length: item.duration,
                enclosure_type: 'audio/mpeg',
            };

            const TrackInfoApi = `${baseUrl}/revision/track/trackPageInfo?trackId=${item.trackId}`; // TrackInfo

            const key = 'podcast' + item.trackId;

            const value = await ctx.cache.get(key);

            if (value) {
                const trackinfo = JSON.parse(value);
                resultItem.description = trackinfo.desc;
                resultItem.pubDate = trackinfo.date;
            } else {
                const TrackInfoResponse = await axios_ins.get(TrackInfoApi);
                const trackinfo_data = TrackInfoResponse.data.data.trackInfo;

                const trackinfo = {
                    desc: trackinfo_data.richIntro,
                    date: new Date(trackinfo_data.lastUpdate).toUTCString(),
                };

                const trackinfoStr = JSON.stringify(trackinfo);

                resultItem.description = trackinfo.desc;
                resultItem.pubDate = trackinfo.date;

                ctx.cache.set(key, trackinfoStr, 24 * 60 * 60);
            }

            return Promise.resolve(resultItem);
        })
    );

    ctx.state.data = {
        title: `${albumtitle}`,
        link: `${albumurl}`,
        description: albumdesc,
        image: cover_url,
        itunes_author: author,
        item: resultItems,
    };
};
