import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/album/:id',
    categories: ['multimedia'],
    example: '/iqiyi/album/神武天尊-2020-1b4lufwxd7h',
    parameters: { id: '剧集 id, 可在该主页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '剧集',
    maintainers: ['TonyRL'],
    handler,
    description: `::: tip
可抓取內容根据服务器所在地区而定
:::`,
};

function getUploadDates($: CheerioAPI) {
    const dates = new Map<string | null, Temporal.Instant>();
    const data = JSON.parse($('script[type="application/ld+json"]:contains("VideoObject")').text());
    const entries = data['@graph'] ?? [data];
    for (const entry of entries) {
        if (entry['@type'] === 'VideoObject') {
            dates.set(new URL(entry.embedUrl).searchParams.get('id'), parseDate(entry.uploadDate)!);
        }
    }
    return dates;
}

async function handler(ctx) {
    const id = ctx.req.param('id');

    const { data: response } = await got(`https://www.iq.com/album/${id}`);

    const $ = load(response);
    const uploadDates = getUploadDates($);
    const nextData = JSON.parse($('#__NEXT_DATA__').text());
    const { album } = nextData.props.initialState;

    const {
        data: { data: baseInfo },
    } = await got(`https://pcw-api.iqiyi.com/album/album/baseinfo/${album.videoAlbumInfo.albumId}`);

    if (Object.keys(album.cacheAlbumList).length === 0) {
        throw new InvalidParameterError(`${baseInfo.name} is not available in this server region.`);
    }

    const {
        data: { data },
    } = await got(`https://pcw-api.iq.com/api/v2/episodeListSource/${album.videoAlbumInfo.albumId}`, {
        searchParams: {
            platformId: 3,
            modeCode: 'intl',
            langCode: 'zh_cn',
            endOrder: album.videoAlbumInfo.maxOrder,
            startOrder: 1,
        },
    });

    const items = data.epg.map((item) => ({
        title: item.name,
        description: renderToString(<img src={item.pic} />),
        link: `https://www.iq.com/play/${item.playLocSuffix}`,
        pubDate: uploadDates.get(item.qipuIdStr) ?? parseDate(item.initIssueTime),
    }));

    return {
        title: baseInfo.name,
        description: baseInfo.description,
        image: album.videoAlbumInfo.albumFocus1024,
        link: `https://www.iq.com/album/${album.videoAlbumInfo.albumLocSuffix}`,
        item: items,
        allowEmpty: true,
    };
}
