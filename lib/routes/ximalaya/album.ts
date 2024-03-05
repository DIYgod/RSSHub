// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const { getUrl, getRandom16 } = require('./utils');
const baseUrl = 'https://www.ximalaya.com';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';

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
    } catch {
        return {};
    }
}

function getTextFromElement(element) {
    if (element.children && element.children.length > 0) {
        return element.children[0].data.trim();
    }
    return '';
}

async function parseAlbumData(category, album_id) {
    // 解析网页版的 HTML 获取该专辑的信息
    // 这里的 {category} 并不重要，系统会准确的返回该 id 对应专辑的信息
    // 现在 {category} 必须要精确到大的类别
    // https://www.ximalaya.com/{category}/{album_id}
    const response = await got(`${baseUrl}/${category}/${album_id}`);
    const data = response.body;
    const $ = load(data);
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

export default async (ctx) => {
    const type = ctx.req.param('type'); // 专辑分类
    const id = ctx.req.param('id'); // 专辑id
    const shouldAll = judgeTrue(ctx.req.param('all'), 'all');
    const shouldShowNote = judgeTrue(ctx.req.param('shownote'), 'shownote');
    const pageSize = shouldAll ? 200 : 30;

    const albumData = await parseAlbumData(type, id);

    const { albumPageMainInfo, currentCategory, anchorInfo } = albumData?.store?.AlbumDetailPage || {};

    const isPaid = albumPageMainInfo.isPaid;

    const authorInfo = anchorInfo; // 作者数据
    const author = authorInfo.nickName;

    const albumInfo = albumPageMainInfo; // 专辑数据
    const albumTitle = albumInfo.albumTitle; // 专辑标题
    const albumCover = 'http:' + albumInfo.cover.split('!')[0];
    const albumIntro = albumInfo.detailRichIntro; // 专辑介绍

    const categoryInfo = currentCategory;
    const albumCategory = categoryInfo?.categoryTitle || albumPageMainInfo.categoryTitle; // 专辑分类名字
    const albumUrl = '/' + (categoryInfo?.categoryPinyin || type) + '/' + id + '/'; // 没有 categoryPinyin 这个字段了，用 type 兼容一下

    // sort 为 1 时是降序
    // const isAsc = albumData.store.AlbumDetailTrackList.sort === 0;
    // 喜马拉雅的 API 的 query 参数 isAsc=0 时才是升序，不写就是降序。
    const trackInfoApi = `http://mobile.ximalaya.com/mobile/v1/album/track/?albumId=${id}&pageSize=${pageSize}&pageId=`;
    const trackInfoResponse = await got(trackInfoApi + '1');
    const maxPageId = trackInfoResponse.data.data.maxPageId; // 最大页数

    let playList = trackInfoResponse.data.data.list;

    if (shouldAll) {
        const promises = [];
        for (let i = 2; i <= maxPageId; i++) {
            // string + number -> string
            promises.push(got(trackInfoApi + i));
        }
        const responses = await Promise.all(promises);
        for (const j of responses) {
            playList = [...playList, ...j.data.data.list];
        }
    }

    await Promise.all(
        playList.map(async (item) => {
            const link = baseUrl + albumUrl + item.trackId;
            item.desc = await cache.tryGet('ximalaya:' + shouldShowNote.toString() + 'trackRichInfo' + link, async () => {
                let _desc;
                if (shouldShowNote) {
                    const trackRichInfoApi = `https://mobile.ximalaya.com/mobile-track/richIntro?trackId=${item.trackId}`;
                    const trackRichInfoResponse = await got(trackRichInfoApi);
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
                const data = await cache.tryGet('ximalaya:trackPayInfo' + trackPayInfoApi, async () => {
                    const trackPayInfoResponse = await got(trackPayInfoApi, {
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
        const itunesItemImage = item.coverLarge ?? albumCover;
        const link = baseUrl + albumUrl + trackId;
        const pubDate = parseDate(item.createdAt, 'x');
        const duration = item.duration; // 时间长度：单位（秒）
        const enclosureUrl = item.playPathAacv224 || item.playPathAacv164;

        let resultItem = {
            title,
            link,
            description: item.desc || '',
            pubDate,
            itunes_item_image: itunesItemImage,
        };

        if (enclosureUrl) {
            if (isPaid) {
                resultItem.description = '[该内容需付费] ' + resultItem.description;
            }
            resultItem = {
                ...resultItem,
                enclosure_url: enclosureUrl,
                itunes_duration: duration,
                enclosure_type: 'audio/x-m4a',
            };
        } else {
            resultItem.description = '[该内容需付费] ' + resultItem.description;
        }

        return resultItem;
    });

    ctx.set('data', {
        title: albumTitle,
        link: baseUrl + albumUrl,
        description: albumIntro,
        image: albumCover,
        itunes_author: author,
        itunes_category: categoryDict[albumCategory] || albumCategory,
        item: resultItems,
    });
};
