const axios = require('../../utils/axios');
const baseUrl = 'http://www.ximalaya.com';
const axios_ins = axios.create({
    responseType: 'json',
});

module.exports = async (ctx) => {
    const id = ctx.params.id; // 专辑id
    const classify = ctx.params.classify; // 专辑分类
    const albumUrl = '/' + classify + '/' + id + '/';

    const AlbumInfoApi = `http://www.ximalaya.com/revision/album?albumId=${id}`; // 专辑数据的API
    const AlbumInfoResponse = await axios_ins.get(AlbumInfoApi);
    const albuminfo = AlbumInfoResponse.data.data.mainInfo; // 专辑数据
    const authorinfo = AlbumInfoResponse.data.data.anchorInfo; // 作者数据
    const trackinfo = AlbumInfoResponse.data.data.tracksInfo; // tracks数据

    const album_title = albuminfo.albumTitle;
    const album_url = baseUrl + albumUrl;
    const album_desc = albuminfo.detailRichIntro;
    const album_cover_url = albuminfo.cover.split('&')[0];
    const album_author = authorinfo.anchorName;
    const tracks_count = trackinfo.trackTotalCount;

    const PlayInfoApi = `http://mobile.ximalaya.com/mobile/v1/album/track?albumId=${id}&pageSize=${tracks_count}`; // 声音播放数据

    const PlayInfoResponse = await axios_ins.get(PlayInfoApi);
    console.log(PlayInfoResponse.data.data.list);
    const playList = PlayInfoResponse.data.data.list;

    const resultItems = await Promise.all(
        playList.map(async (item) => {
            const resultItem = {
                title: item.title,
                link: baseUrl + albumUrl + item.trackId,
                description: '查看原文: ' + baseUrl + albumUrl + item.trackId,
                pubDate: new Date(item.createdAt).toUTCString(),
                itunes_item_image: item.coverLarge,
                enclosure_url: item.playPathAacv224,
                enclosure_length: item.duration,
                enclosure_type: 'audio/mpeg',
            };
            return Promise.resolve(resultItem);
        })
    );

    ctx.state.data = {
        title: `${album_title}`,
        link: `${album_url}`,
        description: album_desc,
        image: album_cover_url,
        itunes_author: album_author,
        item: resultItems,
    };
};
