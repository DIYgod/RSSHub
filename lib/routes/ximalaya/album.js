const axios = require('../../utils/axios');
const baseUrl = 'http://www.ximalaya.com';
const axios_ins = axios.create({});

module.exports = async (ctx) => {
    const id = ctx.params.id; // 专辑id

    const TrackInfoApi = 'http://mobile.ximalaya.com/v1/track/baseInfo?device=android&trackId=';
    const AlbumInfoApi = `https://www.ximalaya.com/revision/album?albumId=${id}`; // 专辑数据的API
    const AlbumInfoResponse = await axios_ins.get(AlbumInfoApi);

    const authorinfo = AlbumInfoResponse.data.data.anchorInfo; // 作者数据
    const author = authorinfo.anchorName;
    const author_intro = authorinfo.personalIntroduction;

    const albuminfo = AlbumInfoResponse.data.data.mainInfo; // 专辑数据
    const album_title = albuminfo.albumTitle; // 专辑标题
    const album_cover = 'http:' + albuminfo.cover.split('!')[0];
    const classify = albuminfo.crumbs.categoryPinyin; // 专辑分类
    const album_category = albuminfo.crumbs.categoryTitle; // 专辑分类名字
    const album_intro = albuminfo.richIntro; // 专辑介绍
    const album_desc = author_intro + ' <br/>' + album_intro;
    const albumUrl = '/' + classify + '/' + id + '/'; // 某分类的链接
    const ispaid = albuminfo.isPaid; // 是否需要付费

    const tracksinfo = AlbumInfoResponse.data.data.tracksInfo; // 专辑数据
    const playList = tracksinfo.tracks;

    const resultItems = await Promise.all(
        playList.map(async (item) => {
            const title = item.title;
            const trackId = item.trackId;
            const trackUrl = item.url;
            const link = baseUrl + trackUrl;

            let resultItem = {};
            const value = await ctx.cache.get(link);
            if (value) {
                resultItem = JSON.parse(value);
            } else {
                const track = await axios_ins.get(TrackInfoApi + trackId);
                const track_item = track.data;
                const enclosure_length = track_item.duration; // 时间长度：单位（秒）

                let desc = track_item.intro ? track_item.intro.replace(/((\r\n)+(\s)?)+/g, '<br/>') : '暂无简介';
                const itunes_item_image = track_item.coverLarge ? track_item.coverLarge.split('!')[0] : albuminfo.cover.split('!')[0];

                if (ispaid) {
                    desc = desc + '<br/>' + ' [付费内容请打开网页收听] : ' + `<a href="${link}">${link}</a>`;
                }

                resultItem = {
                    title: title,
                    link: link,
                    description: desc,
                    pubDate: new Date(track_item.createdAt).toUTCString(),
                    itunes_item_image: itunes_item_image,
                    enclosure_url: track_item.playPathAacv224,
                    enclosure_length: enclosure_length,
                    enclosure_type: 'audio/x-m4a',
                };

                ctx.cache.set(link, JSON.stringify(resultItem), 24 * 60 * 60);
            }

            return Promise.resolve(resultItem);
        })
    );

    ctx.state.data = {
        title: `${album_title}`,
        link: `${baseUrl + albumUrl}`,
        description: album_desc,
        image: album_cover,
        itunes_author: author,
        itunes_category: album_category,
        item: resultItems,
    };
};
