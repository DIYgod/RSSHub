import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import type { Feed } from './types';
import { parseFeed } from './utils';

const baseUrl = 'https://pd.qq.com/g/';
const baseApiUrl = 'https://pd.qq.com/qunng/guild/gotrpc/noauth/trpc.qchannel.commreader.ComReader/';
const getGuildFeedsUrl = baseApiUrl + 'GetGuildFeeds';
const getChannelTimelineFeedsUrl = baseApiUrl + 'GetChannelTimelineFeeds';
const getFeedDetailUrl = baseApiUrl + 'GetFeedDetail';

const sortMap = {
    hot: 0,
    created: 1,
    replied: 2,
};

export const route: Route = {
    path: ['/pd/guild/:id/:sub?/:sort?'],
    categories: ['bbs'],
    example: '/qq/pd/guild/qrp4pkq01d/650967831/created',
    parameters: {
        id: '频道号',
        sub: '子频道 ID，网页端 URL `subc` 参数的值，默认为 `hot`（全部）',
        sort: '排序方式，`hot`（热门），`created`（最新发布），`replied`（最新回复），默认为 `created`',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['pd.qq.com/'],
        },
    ],
    name: '腾讯频道',
    maintainers: ['mobyw'],
    handler,
    url: 'pd.qq.com/',
};

async function handler(ctx: Context): Promise<Data> {
    const { id, sub = 'hot', sort = 'created' } = ctx.req.param();

    if (sort in sortMap === false) {
        throw new InvalidParameterError('invalid sort parameter, should be `hot`, `created`, or `replied`');
    }
    const sortType = sortMap[sort];

    let url = '';
    let body = {};
    let headers = {};

    if (sub === 'hot') {
        url = getGuildFeedsUrl;
        // notice: do not change the order of the keys in the body
        body = { count: 20, from: 7, guild_number: id, get_type: 1, feedAttchInfo: '', sortOption: sortType, need_channel_list: false, need_top_info: false };
        headers = {
            cookie: 'p_uin=o09000002',
            'x-oidb': '{"uint32_service_type":12}',
            'x-qq-client-appid': '537246381',
        };
    } else {
        url = getChannelTimelineFeedsUrl;
        // notice: do not change the order of the keys in the body
        body = { count: 20, from: 7, guild_number: id, channelSign: { channel_id: sub }, feedAttchInfo: '', sortOption: sortType, need_top_info: false };
        headers = {
            cookie: 'p_uin=o09000002',
            'x-oidb': '{"uint32_service_type":11}',
            'x-qq-client-appid': '537246381',
        };
    }

    const data = await ofetch(url, { method: 'POST', body, headers });
    const feeds = data.data?.vecFeed || [];

    const items = feeds.map(async (feed: Feed) => {
        let subId = sub;
        if (sub === 'hot') {
            // get real subId for hot feeds
            subId = feed.channelInfo?.sign?.channel_id || '';
        }
        const feedLink = baseUrl + id + '/post/' + feed.id;
        const feedDetail = await cache.tryGet(feedLink, async () => {
            // notice: do not change the order of the keys in the body
            body = {
                feedId: feed.id,
                userId: feed.poster?.id,
                createTime: feed.createTime,
                from: 2,
                detail_type: 1,
                channelSign: { guild_number: id, channel_id: subId },
                extInfo: {
                    mapInfo: [
                        { key: 'qc-tabid', value: 'ark' },
                        { key: 'qc-pageid', value: 'pc' },
                    ],
                },
            };
            headers = {
                cookie: 'p_uin=o09000002',
                referer: feedLink,
                'x-oidb': '{"uint32_service_type":5}',
                'x-qq-client-appid': '537246381',
            };
            const feedResponse = await ofetch(getFeedDetailUrl, { method: 'POST', body, headers });
            const feedContent: Feed = feedResponse.data?.feed || {};
            return {
                title: feed.title?.contents[0]?.text_content?.text || feed.channelInfo?.guild_name || '',
                link: feedLink,
                description: parseFeed(feedContent),
                pubDate: new Date(Number(feed.createTime) * 1000),
                author: feed.poster?.nick,
            };
        });

        return feedDetail;
    });

    const feedItems = await Promise.all(items);

    let guildName = '';

    if (feeds.length > 0 && feeds[0].channelInfo?.guild_name) {
        guildName = feeds[0].channelInfo?.guild_name;
        if (sub !== 'hot' && feeds[0].channelInfo?.name) {
            guildName += ' (' + feeds[0].channelInfo?.name + ')';
        }
        guildName += ' - 腾讯频道';
    }

    return {
        title: guildName,
        link: baseUrl + id,
        description: guildName,
        item: feedItems as DataItem[],
    };
}
