const got = require('@/utils/got');
const baseUrl = 'http://www.ximalaya.com';
const got_ins = got.extend({});

module.exports = async (ctx) => {
    const id = ctx.params.id; // 专辑id
    const isAll = ctx.params.all ? true : false;
    const pageSize = isAll ? 200 : 30;
    const AlbumInfoApi = `https://www.ximalaya.com/revision/album?albumId=${id}`; // 专辑数据的API
    const AlbumInfoResponse = await got_ins.get(AlbumInfoApi);

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
    const isAsc = AlbumInfoResponse.data.data.tracksInfo.sort === 0;

    const TrackInfoApi = `http://mobile.ximalaya.com/mobile/v1/album/track/?albumId=${id}&isAsc=${!isAsc}&pageSize=${pageSize}&pageId=`;
    const TrackInfoResponse = await got_ins.get(TrackInfoApi + 1);
    const maxPageId = TrackInfoResponse.data.data.maxPageId; // 专辑数据

    let playList = TrackInfoResponse.data.data.list;

    if (isAll) {
        const promises = [];
        for (let i = 2; i <= maxPageId; i++) {
            promises.push(got_ins.get(TrackInfoApi + i));
        }
        const responses = await Promise.all(promises);
        for (let j = 0; j < responses.length; j++) {
            playList = playList.concat(responses[j].data.data.list);
        }
    }

    const resultItems = await Promise.all(
        playList.map(async (item) => {
            const title = item.title;
            const trackId = item.trackId;
            const itunes_item_image = item.coverLarge ? item.coverLarge : album_cover;
            const link = baseUrl + albumUrl + trackId;
            const pubDate = new Date(item.createdAt).toUTCString();
            const enclosure_length = item.duration; // 时间长度：单位（秒）
            const enclosure_url = item.playPathAacv224;

            let desc = '请在网页查看声音简介：' + `<a href="${link}">${link}</a>`;

            if (ispaid) {
                desc = ' [该内容需付费，请打开网页收听] ' + '<br/>' + desc;
            }

            const resultItem = {
                title: title,
                link: link,
                description: desc,
                pubDate: pubDate,
                itunes_item_image: itunes_item_image,
                enclosure_url: enclosure_url,
                enclosure_length: enclosure_length,
                enclosure_type: 'audio/x-m4a',
            };
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
