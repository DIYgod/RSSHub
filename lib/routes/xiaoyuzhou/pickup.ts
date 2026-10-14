import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const XIAOYUZHOU_ITEMS = 'xiaoyuzhou_items';

const isToday = (date) => {
    const sourceDate = new Date(new Date(date).getTime() + 8 * 60 * 60 * 1000);
    const today = new Date(Date.now() + 8 * 60 * 60 * 1000);
    return sourceDate.getUTCDate() === today.getUTCDate() && sourceDate.getUTCMonth() === today.getUTCMonth() && sourceDate.getUTCFullYear() === today.getUTCFullYear();
};

const processFeed = async () => {
    const deviceId = config.xiaoyuzhou.device_id || 'f5d56d9a-8530-49a4-a6d2-cfb4b7a31240';
    const refreshToken = (await cache.get('XIAOYUZHOU_TOKEN')) || config.xiaoyuzhou.refresh_token;
    if (!refreshToken) {
        throw new ConfigNotFoundError('XIAOYUZHOU_TOKEN is required to fetch editor picks. Configure a valid refresh token for your Xiaoyuzhou account.');
    }

    const headers = {
        applicationid: 'app.podcast.cosmos',
        'app-version': '1.6.0',
        'x-jike-device-id': deviceId,
        'user-agent': 'okhttp/4.7.2',
    };

    const tokenUpdated = await got({
        method: 'post',
        url: 'https://api.xiaoyuzhoufm.com/app_auth_tokens.refresh',
        headers: {
            ...headers,
            'x-jike-refresh-token': refreshToken,
        },
    });
    cache.set('XIAOYUZHOU_TOKEN', tokenUpdated.data['x-jike-refresh-token']);

    const response = await got({
        method: 'post',
        url: 'https://api.xiaoyuzhoufm.com/v1/editor-pick/list',
        headers: {
            ...headers,
            'x-jike-access-token': tokenUpdated.data['x-jike-access-token'],
        },
        json: {},
    });

    const data = response.data.data;
    const playList: any[] = [];
    for (const dailyPicks of data) {
        const pubDate = new Date(dailyPicks.date + ' 00:00:00 +0800').toUTCString();
        for (const pick of dailyPicks.picks) {
            pick.pubDate = pubDate;
            playList.push(pick);
        }
    }

    return playList.map((item) => {
        const title = item.episode.title + ' - ' + item.episode.podcast.title;
        const eid = item.episode.eid;
        const itunesItemImage = item.episode.image ? item.episode.image.picUrl : item.episode.podcast.image ? item.episode.podcast.image.picUrl : '';
        const link = `https://www.xiaoyuzhoufm.com/episode/${eid}`;
        const pubDate = item.pubDate;
        const itunesDuration = item.episode.duration;
        const enclosureUrl = item.episode.enclosure.url;
        const desc = `<p><strong>${item.comment.author.nickname}：</strong>${item.comment.text}</p><hr>` + item.episode.shownotes;
        const author = item.episode.podcast.author;

        return {
            title,
            description: desc,
            link,
            author,
            pubDate,
            enclosure_url: enclosureUrl,
            itunes_duration: itunesDuration,
            itunes_item_image: itunesItemImage,
            enclosure_type: 'audio/mpeg',
        };
    });
};

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['xiaoyuzhoufm.com/'],
            target: '',
        },
    ],
    name: '发现',
    example: '/xiaoyuzhou',
    categories: ['multimedia'],
    features: {
        requireConfig: [
            {
                name: 'XIAOYUZHOU_TOKEN',
                description: '小宇宙账户的 refresh token，用于获取编辑精选。',
            },
            {
                name: 'XIAOYUZHOU_ID',
                optional: true,
                description: '小宇宙账户的设备 ID。',
            },
        ],
    },
    maintainers: ['prnake', 'Maecenas'],
    handler,
    url: 'xiaoyuzhoufm.com/',
    description: `::: warning
需要配置小宇宙账户的 \`XIAOYUZHOU_TOKEN\`（refresh token）。可选配置 \`XIAOYUZHOU_ID\`（设备 ID），具体见部署文档。
:::`,
};

async function handler() {
    let resultItems = await cache.tryGet(XIAOYUZHOU_ITEMS, () => processFeed());
    if (resultItems[0] && !isToday(resultItems[0].pubDate)) {
        // force refresh cache
        resultItems = await processFeed();
        cache.set(XIAOYUZHOU_ITEMS, resultItems);
    }
    return {
        title: '小宇宙 - 发现',
        link: 'https://www.xiaoyuzhoufm.com/',
        description: '小宇宙的编辑精选',
        image: 'https://www.xiaoyuzhoufm.com/apple-touch-icon.png',
        itunes_author: '小宇宙',
        itunes_category: 'Society & Culture',
        item: resultItems,
    };
}
