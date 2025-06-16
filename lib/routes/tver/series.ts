import { Route, Data, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { Context } from 'hono';

export const route: Route = {
    path: '/series/:id',
    categories: ['traditional-media'],
    example: '/tver/series/srx2o7o3c8',
    parameters: {
        category: 'Series ID (as it appears in URLs). For example, in https://tver.jp/series/srx2o7o3c8, the ID is "srx2o7o3c8".',
    },
    radar: [
        {
            source: ['tver.jp/series/:id'],
            target: '/series/:id',
        },
    ],
    name: 'Series',
    maintainers: ['yuikisaito'],
    handler,
};

const commonHeaders = {
    Accept: '*/*',
    'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    'Sec-GPC': '1',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
};

async function handler(ctx: Context): Promise<Data> {
    const { id } = ctx.req.param();

    const { result: browser } = await ofetch('https://platform-api.tver.jp/v2/api/platform_users/browser/create', {
        method: 'POST',
        body: 'device_type=pc',
        headers: {
            ...commonHeaders,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        referrer: 'https://s.tver.jp/',
        credentials: 'omit',
        mode: 'cors',
    });

    const { platform_uid, platform_token } = browser;

    const { title, description, broadcastProvider } = await ofetch(`https://statics.tver.jp/content/series/${id}.json`, {
        method: 'GET',
        headers: {
            ...commonHeaders,
        },
        referrer: 'https://tver.jp/',
        credentials: 'omit',
        mode: 'cors',
    });

    const { result } = await ofetch(`https://platform-api.tver.jp/service/api/v1/callSeriesEpisodes/${id}?platform_uid=${platform_uid}&platform_token=${platform_token}`, {
        method: 'GET',
        headers: {
            ...commonHeaders,
            'x-tver-platform-type': 'web',
        },
        referrer: 'https://tver.jp/',
        credentials: 'omit',
        mode: 'cors',
    });

    const items: DataItem[] = (result.contents?.[0]?.contents ?? [])
        .filter((i) => i.type === 'episode')
        .map((i) => {
            const rawPubDate = i.content.broadcastDateLabel;
            const cleanedPubDate = rawPubDate.replaceAll(/\(.*?\)|放送分/g, '').trim();
            const parsedPubDate = timezone(parseDate(cleanedPubDate, 'M月D日'), +9).toDateString();

            return {
                title: i.content.title,
                link: `https://tver.jp/episodes/${i.content.id}`,
                image: `https://statics.tver.jp/images/content/thumbnail/episode/large/${i.content.id}.jpg`,
                pubDate: parsedPubDate,
            };
        });

    return {
        title: 'TVer - ' + title,
        description,
        author: broadcastProvider.name,
        link: `https://tver.jp/series/${id}`,
        image: `https://statics.tver.jp/images/content/thumbnail/series/large/${id}.jpg`,
        language: 'ja',
        item: items,
    };
}
