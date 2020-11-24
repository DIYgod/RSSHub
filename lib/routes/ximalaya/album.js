const got = require('@/utils/got');
const { getUrl, getRandom16 } = require('./utils');
const baseUrl = 'http://www.ximalaya.com';
const got_ins = got.extend({});
const config = require('@/config').value;

// Find category from: https://help.apple.com/itc/podcasts_connect/?lang=en#/itc9267a2f12
const categoryDict = {
    人文: 'Society & Culture',
    历史: 'History',
    头条: 'News',
    娱乐: 'Leisure',
    音乐: 'Music',
    IT科技: 'Technology',
};

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
    const isAsc = AlbumInfoResponse.data.data.tracksInfo.sort === 0;
    const token = config.ximalaya.token;
    const RandomToken = getRandom16(8) + '-' + getRandom16(4) + '-' + getRandom16(4) + '-' + getRandom16(4) + '-' + getRandom16(12);

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

    await Promise.all(
        playList.map(async (item) => {
            const link = baseUrl + albumUrl + item.trackId;
            const TrackRichInfoApi = `https://mobile.ximalaya.com/mobile-track/richIntro?trackId=${item.trackId}`;
            const TrackRichInfoResponse = await got({
                method: 'get',
                url: TrackRichInfoApi,
            });
            item.desc = TrackRichInfoResponse.data.richIntro;
            if (!item.desc) {
                item.desc = '请在网页查看声音简介：' + `<a href="${link}">${link}</a>`;
            }
        })
    );

    if (token) {
        await Promise.all(
            playList.map(async (item) => {
                const TrackPayInfoApi = `https://mpay.ximalaya.com/mobile/track/pay/${item.trackId}/?device=pc`;
                const TrackPayInfoResponse = await got({
                    method: 'get',
                    url: TrackPayInfoApi,
                    headers: {
                        'user-agent': 'ting_6.7.9(GM1900,Android29)',
                        cookie: `1&_device=android&${RandomToken}&6.7.9;1&_token=${token}`,
                    },
                });
                if (TrackPayInfoResponse.data.ep) {
                    item.playPathAacv224 = getUrl(TrackPayInfoResponse.data);
                } else if (TrackPayInfoResponse.data.msg) {
                    item.desc += '<br/>' + TrackPayInfoResponse.data.msg;
                }
            })
        );
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
            let desc = item.desc;

            if (!enclosure_url) {
                desc = ' [该内容需付费，请打开网页收听] ' + `<br/><a href="${link}">${link}</a>` + desc;
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
        itunes_category: categoryDict[album_category] || album_category,
        item: resultItems,
    };
};
