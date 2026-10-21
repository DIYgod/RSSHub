import pMap from 'p-map';
import sanitizeHtml from 'sanitize-html';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { Album, MobileTrack, RichIntro, TrackInfoResponse } from './types';
import { decryptUrl, getRandom16, getXmSign } from './utils';

const baseUrl = 'https://www.ximalaya.com';
type TrackPayInfo = {
    playPathAacv224?: string;
    desc?: string;
};
// Find category from: https://help.apple.com/itc/podcasts_connect/?lang=en#/itc9267a2f12
const categoryDict = {
    人文: 'Society & Culture',
    历史: 'History',
    头条: 'News',
    娱乐: 'Leisure',
    音乐: 'Music',
    IT科技: 'Technology',
};
function getAlbumData(albumId) {
    return cache.tryGet(`ximalaya:albumInfo:${albumId}`, async () => {
        const response = await ofetch<{
            data: {
                albumPageMainInfo: Album;
            };
        }>(`${baseUrl}/revision/album/v1/simple`, {
            query: {
                albumId,
            },
            parseResponse: JSON.parse,
        });
        return response.data.albumPageMainInfo;
    });
}
function judgeTrue(str, ...validStrings) {
    if (!str) {
        return false;
    }
    str = str.toLowerCase();
    if (isOneOf(str, ['true', '1'])) {
        return true;
    }
    for (const _s of validStrings) {
        if (str === _s) {
            return true;
        }
    }
    return false;
}
export const route: Route = {
    path: '/:type/:id/:all?/:shownote?',
    categories: ['multimedia'],
    example: '/ximalaya/album/299146',
    parameters: {
        type: '专辑类型, 通常可以使用 `album`，可在对应专辑页面的 URL 中找到',
        id: '专辑 id, 可在对应专辑页面的 URL 中找到',
        all: '是否获取首屏最多 200 个节目，填入 `1`、`true`、`all` 视为开启，填入其他则获取首屏最多 30 个节目。',
        shownote: '是否需要获取节目的 ShowNote，填入 `1`、`true`,`shownote` 视为获取，填入其他则不获取。',
    },
    features: {
        requireConfig: [
            {
                name: 'XIMALAYA_TOKEN',
                optional: true,
                description: '仅获取已购买的付费内容时需要配置。',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    name: '专辑',
    maintainers: ['lengthmin', 'jjeejj', 'prnake'],
    handler,
    description: `目前喜马拉雅的 API 只能一集一集的获取各节目上的 ShowNote，会极大的占用系统资源，所以默认为不获取节目的 ShowNote。

::: warning
专辑类型即 url 中的分类拼音，使用通用分类 \`album\` 通常是可行的，专辑 id 是跟在**分类拼音**后的那个 id, 不要输成某集的 id 了

**付费内容需要配置好已购买账户的 token 才能收听，详情见部署页面的配置模块**
:::`,
};
async function handler(ctx) {
    const type = ctx.req.param('type'); // Album category
    const id = ctx.req.param('id'); // Album ID
    const shouldAll = judgeTrue(ctx.req.param('all'), 'all');
    const shouldShowNote = judgeTrue(ctx.req.param('shownote'), 'shownote');
    const pageSize = shouldAll ? 200 : 30;
    const albumData = await getAlbumData(id);
    const isPaid = albumData.isPaid;
    const author = albumData.anchorName;
    const albumTitle = albumData.albumTitle; // Album title
    const albumCover = 'https:' + albumData.cover;
    const albumIntro = sanitizeHtml(albumData.detailRichIntro, { allowedTags: [], allowedAttributes: {} }); // Album introduction
    const albumCategory = albumData.categoryTitle; // Album category name
    // A sort value of 1 means descending order
    // const isAsc = albumData.store.AlbumDetailTrackList.sort === 0;
    // The API uses isAsc=0 for ascending order and defaults to descending order.
    const trackInfoApi = `https://mobile.ximalaya.com/mobile/v1/album/track/?albumId=${id}&pageSize=${pageSize}&pageId=`;
    const trackInfoResponse = await ofetch<TrackInfoResponse>(trackInfoApi + '1', {
        parseResponse: JSON.parse,
    });
    const playList = trackInfoResponse.data.list;
    await pMap(
        playList,
        async (item) => {
            item.desc = item.intro;
            if (shouldShowNote) {
                const detail = await cache.tryGet(`ximalaya:trackRichInfo:v2:${item.trackId}`, async () => {
                    const trackRichInfoApi = `https://mobile.ximalaya.com/mobile-track/richIntro?trackId=${item.trackId}`;
                    const trackRichInfoResponse = await ofetch<RichIntro>(trackRichInfoApi);
                    return { richIntro: trackRichInfoResponse.richIntro };
                });
                item.desc = detail.richIntro || item.intro;
            }
            const playPath = await cache.tryGet(`ximalaya:track:${item.trackId}`, async () => {
                const track = await ofetch<MobileTrack>(`https://m.ximalaya.com/tracks/${item.trackId}.json`);
                return { url: track.play_path_64 ?? track.play_path_32 ?? track.play_path ?? '' };
            });
            item.playPathAacv224 = playPath.url;
        },
        { concurrency: 3, stopOnError: false }
    );
    const token = config.ximalaya.token;
    if (isPaid && token) {
        const randomToken = getRandom16(8) + '-' + getRandom16(4) + '-' + getRandom16(4) + '-' + getRandom16(4) + '-' + getRandom16(12);
        await pMap(
            playList,
            async (item) => {
                const timestamp = Math.floor(Date.now());
                const trackPayInfoApi = `https://www.ximalaya.com/mobile-playpage/track/v3/baseInfo/${timestamp}?device=www2&trackQualityLevel=2&trackId=${item.trackId}`;
                const data = await cache.tryGet('ximalaya:trackPayInfo' + trackPayInfoApi, async () => {
                    const trackPayInfoResponse = await ofetch(trackPayInfoApi, {
                        headers: {
                            'user-agent': 'ting_6.7.9(GM1900,Android29)',
                            cookie: `1&_device=android&${randomToken}&6.7.9;1&_token=${token}`,
                            'xm-sign': getXmSign(),
                        },
                    });
                    const trackInfo = trackPayInfoResponse.trackInfo;
                    const _item: TrackPayInfo = {};
                    if (!trackInfo?.isAuthorized) {
                        return _item;
                    }
                    _item.playPathAacv224 = decryptUrl(trackInfo.playUrlList[0].url);
                    return _item;
                });
                if (data.playPathAacv224) {
                    item.playPathAacv224 = data.playPathAacv224;
                }
                if (data.desc) {
                    item.desc = data.desc;
                }
            },
            { concurrency: 3, stopOnError: false }
        );
    }
    const resultItems = playList.map((item) => {
        const title = item.title;
        const trackId = item.trackId;
        const itunesItemImage = item.coverLarge.split('!', 1)[0];
        const link = `${baseUrl}/sound/${trackId}`;
        const pubDate = !isNullish(item.createdAt) && getClockText(item.createdAt) && isFiniteClock(item.createdAt) ? parseDate(item.createdAt, 'x') : undefined;
        const duration = item.duration; // Duration in seconds
        const enclosureUrl = item.playPathAacv224 || item.playPathAacv164;
        let resultItem: DataItem = {
            title,
            link,
            description: item.desc || '',
            pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
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
        } else if (isPaid) {
            resultItem.description = '[该内容需付费] ' + resultItem.description;
        }
        return resultItem;
    });
    return {
        title: albumTitle,
        link: `${baseUrl}/${type}/${id}`,
        description: albumIntro,
        image: albumCover,
        itunes_author: author,
        itunes_category: categoryDict[albumCategory] || albumCategory,
        item: resultItems,
    };
}
function isNullish(value: unknown): value is null | undefined {
    return isOneOf(value, [null, undefined]);
}
function isOneOf<const T>(value: unknown, values: readonly T[]): value is T {
    const candidates: readonly unknown[] = values;
    return candidates.includes(value);
}
function getClockText(value: string | number): string {
    return String(value).trim();
}

function isFiniteClock(value: string | number): boolean {
    return Number.isFinite(Number(value));
}
