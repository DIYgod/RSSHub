const got = require('@/utils/got');
const cheerio = require('cheerio');
const { getUrl, getRandom16 } = require('./utils');
const baseUrl = 'http://www.ximalaya.com';
const gotIns = got.extend({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
    },
});
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

// function parseState(state_string) {
//     const data = {};
//     new Function('window', state_string)(data);
//     return data.__INITIAL_STATE__ || {};
// }
/**
 *
 * @param {string} stateString 网页中的有一处 script 标签内有语句
 * `window.__INITIAL_STATE__ = {"xx": "xx"};`
 */
function parseStateSafe(stateString) {
    const prefix = 'window.__INITIAL_STATE__ = ';
    const suffix = ';';
    stateString = stateString.slice(prefix.length, stateString.length - suffix.length);
    try {
        return JSON.parse(stateString);
    } catch (_) {
        return {};
    }
}

function getTextFromElement(element) {
    if (element.children && element.children.length > 0) {
        return element.children[0].data.trim();
    }
    return '';
}

async function parseAlbumData(album_id) {
    // 解析网页版的 HTML 获取该专辑的信息
    // 这里的 {category} 并不重要，系统会准确的返回该 id 对应专辑的信息
    // https://www.ximalaya.com/{category}/{album_id}/
    const response = await gotIns(`https://www.ximalaya.com/category/${album_id}/`);
    const data = response.body;
    const $ = cheerio.load(data);
    const stateElement = $('script')
        .toArray()
        .filter((element) => getTextFromElement(element).startsWith('window.__INITIAL_STATE__'));
    if (stateElement.length > 0) {
        const stateString = getTextFromElement(stateElement[0]);
        if (stateString) {
            return parseStateSafe(stateString);
        }
    }
    return {};
}

function judgeTrue(str, ...validStrings) {
    if (!str) {
        return false;
    }
    str = str.toLowerCase();
    if (str === 'true' || str === '1') {
        return true;
    }
    for (const _s of validStrings) {
        if (str === _s) {
            return true;
        }
    }
    return false;
}

module.exports = async (ctx) => {
    const id = ctx.params.id; // 专辑id
    const shouldAll = judgeTrue(ctx.params.all, 'all');
    const shouldShowNote = judgeTrue(ctx.params.shownote, 'shownote');
    const pageSize = shouldAll ? 200 : 30;

    const albumData = await parseAlbumData(id);

    const isPaid = albumData.store.AlbumDetailPage.albumPageMainInfo.isPaid;

    const authorInfo = albumData.store.AlbumDetailPage.anchorInfo; // 作者数据
    const author = authorInfo.nickName;

    const albumInfo = albumData.store.AlbumDetailPage.albumPageMainInfo; // 专辑数据
    const albumTitle = albumInfo.albumTitle; // 专辑标题
    const albumCover = 'http:' + albumInfo.cover.split('!')[0];
    const albumIntro = albumInfo.detailRichIntro; // 专辑介绍

    const categoryInfo = albumData.store.AlbumDetailPage.currentCategory;
    const albumCategory = categoryInfo.categoryTitle; // 专辑分类名字
    const albumUrl = '/' + categoryInfo.categoryPinyin + '/' + id + '/';

    // sort 为 1 时是降序
    // const isAsc = albumData.store.AlbumDetailTrackList.sort === 0;
    // 喜马拉雅的 API 的 query 参数 isAsc=0 时才是升序，不写就是降序。
    const trackInfoApi = `http://mobile.ximalaya.com/mobile/v1/album/track/?albumId=${id}&pageSize=${pageSize}&pageId=`;
    const trackInfoResponse = await gotIns.get(trackInfoApi + '1');
    const maxPageId = trackInfoResponse.data.data.maxPageId; // 最大页数

    let playList = trackInfoResponse.data.data.list;

    if (shouldAll) {
        const promises = [];
        for (let i = 2; i <= maxPageId; i++) {
            // string + number -> string
            promises.push(gotIns.get(trackInfoApi + i));
        }
        const responses = await Promise.all(promises);
        for (let j = 0; j < responses.length; j++) {
            playList = playList.concat(responses[j].data.data.list);
        }
    }

    await Promise.all(
        playList.map(async (item) => {
            const link = baseUrl + albumUrl + item.trackId;
            item.desc = await ctx.cache.tryGet(shouldShowNote.toString() + 'trackRichInfo' + link, async () => {
                let _desc;
                if (shouldShowNote) {
                    const trackRichInfoApi = `https://mobile.ximalaya.com/mobile-track/richIntro?trackId=${item.trackId}`;
                    const trackRichInfoResponse = await gotIns.get(trackRichInfoApi);
                    _desc = trackRichInfoResponse.data.richIntro;
                }
                if (!_desc) {
                    _desc = `<a href="${link}">在网页中查看</a>`;
                }
                return _desc;
            });
        })
    );

    const token = config.ximalaya.token;
    const randomToken = getRandom16(8) + '-' + getRandom16(4) + '-' + getRandom16(4) + '-' + getRandom16(4) + '-' + getRandom16(12);
    if (isPaid && token) {
        await Promise.all(
            playList.map(async (item) => {
                const trackPayInfoApi = `https://mpay.ximalaya.com/mobile/track/pay/${item.trackId}/?device=pc`;
                const data = await ctx.cache.tryGet('trackPayInfo' + trackPayInfoApi, async () => {
                    const trackPayInfoResponse = await got({
                        method: 'get',
                        url: trackPayInfoApi,
                        headers: {
                            'user-agent': 'ting_6.7.9(GM1900,Android29)',
                            cookie: `1&_device=android&${randomToken}&6.7.9;1&_token=${token}`,
                        },
                    });
                    const _item = {};
                    if (trackPayInfoResponse.data.ep) {
                        _item.playPathAacv224 = getUrl(trackPayInfoResponse.data);
                    } else if (trackPayInfoResponse.data.msg) {
                        _item.desc = item.desc + '<br/>' + trackPayInfoResponse.data.msg;
                    }
                    return _item;
                });
                if (data.playPathAacv224) {
                    item.playPathAacv224 = data.playPathAacv224;
                }
                if (data.desc) {
                    item.desc = data.desc;
                }
            })
        );
    }

    const resultItems = playList.map((item) => {
        const title = item.title;
        const trackId = item.trackId;
        const itunesItemImage = item.coverLarge ? item.coverLarge : albumCover;
        const link = baseUrl + albumUrl + trackId;
        const pubDate = new Date(item.createdAt).toUTCString();
        const enclosureLength = item.duration; // 时间长度：单位（秒）
        const enclosureUrl = item.playPathAacv224 || item.playPathAacv164;

        let resultItem = {
            title,
            link,
            description: item.desc || '',
            pubDate,
            itunes_item_image: itunesItemImage,
        };

        if (!enclosureUrl) {
            resultItem.description = '[该内容需付费] ' + resultItem.description;
        } else {
            if (isPaid) {
                resultItem.description = '[该内容需付费] ' + resultItem.description;
            }
            resultItem = {
                ...resultItem,
                enclosure_url: enclosureUrl,
                enclosure_length: enclosureLength,
                enclosure_type: 'audio/x-m4a',
            };
        }

        return resultItem;
    });

    ctx.state.data = {
        title: `${albumTitle}`,
        link: `${baseUrl + albumUrl}`,
        description: albumIntro,
        image: albumCover,
        itunes_author: author,
        itunes_category: categoryDict[albumCategory] || albumCategory,
        item: resultItems,
    };
};
