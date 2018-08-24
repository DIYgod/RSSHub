const axios = require('../../utils/axios');
const baseUrl = 'http://www.ximalaya.com';
const axios_ins = axios.create({
    responseType: 'json',
});

module.exports = async (ctx) => {
    const id = ctx.params.id; // 专辑id

    const AlbumInfoApi = `http://www.ximalaya.com/revision/album?albumId=${id}`; // 专辑数据的API
    const AlbumInfoResponse = await axios_ins.get(AlbumInfoApi);

    const albuminfo = AlbumInfoResponse.data.data.mainInfo; // 专辑数据
    const authorinfo = AlbumInfoResponse.data.data.anchorInfo; // 作者数据
    const trackinfo = AlbumInfoResponse.data.data.tracksInfo; // tracks数据

    const classify = albuminfo.crumbs.categoryPinyin; // 专辑分类的拼音
    const album_category = albuminfo.crumbs.categoryTitle; // 专辑分类
    const albumUrl = '/' + classify + '/' + id + '/'; // 某分类的链接
    const ispaid = albuminfo.isPaid; // 是否需要付费
    const album_title = albuminfo.albumTitle; // 专辑标题
    const album_url = baseUrl + albumUrl; // 专辑链接
    const album_desc = authorinfo.anchorName + ' ' + authorinfo.personalIntroduction + ' </br>' + albuminfo.detailRichIntro;
    const album_cover_url = albuminfo.cover.split('&')[0];
    const album_author = authorinfo.anchorName;
    const tracks_count = trackinfo.trackTotalCount;

    const PlayInfoApi = `http://mobile.ximalaya.com/mobile/v1/album/track?albumId=${id}&pageSize=${tracks_count}`; // 声音播放数据
    const PlayInfoResponse = await axios_ins.get(PlayInfoApi);

    const playList = PlayInfoResponse.data.data.list;

    const resultItems = await Promise.all(
        playList.map(async (item) => {
            const title = item.title;
            let desc = title + '</br>查看收听提示: </br>' + baseUrl + albumUrl + item.trackId;
            if (ispaid) {
                desc = title + '</br> [付费内容无法收听] 原文链接： </br>' + baseUrl + albumUrl + item.trackId;
            }
            const enclosure_length = item.duration; // 时间长度：单位（秒）
            // itunes_duration格式：<itunes:duration>32:46</itunes:duration>
            const itunes_duration = Math.floor(enclosure_length / 3600) + ':' + Math.floor((enclosure_length % 3600) / 60) + ':' + (((enclosure_length % 3600) % 60) / 100).toFixed(2).slice(-2);

            const resultItem = {
                title: title,
                link: baseUrl + albumUrl + item.trackId,
                description: desc,
                pubDate: new Date(item.createdAt).toUTCString(),
                itunes_item_image: item.coverLarge,
                enclosure_url: item.playPathAacv224,
                enclosure_length: enclosure_length,
                enclosure_type: 'audio/m4a',
                itunes_duration: itunes_duration,
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
        itunes_category: album_category,
        item: resultItems,
    };
};
