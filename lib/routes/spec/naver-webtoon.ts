import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import type { SpecExtraNaverWebtoon } from '@/types/spec-extra';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { buildCacheKey } from './utils';

const NAVER_WEBTOON_ORIGIN = 'https://comic.naver.com';
const EPISODE_PAGE_SIZE = 50;

interface WebtoonEpisode {
    no: number;
    title: string;
    thumbnail: string;
    date: string;
}

interface WebtoonApiResponse {
    bodies: WebtoonEpisode[];
    titleInfo?: { title?: string };
}

export const route: Route = {
    path: '/naver/webtoon/:titleId',
    categories: ['multimedia'],
    example: '/spec/naver/webtoon/570503',
    parameters: {
        titleId: 'Naver Webtoon title ID — numeric. Found in the URL: comic.naver.com/webtoon/list?titleId=:titleId',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    url: 'comic.naver.com',
    name: 'Webtoon Episodes',
    maintainers: ['koreanpatch'],
    radar: [
        {
            source: ['comic.naver.com/webtoon/list?titleId=:titleId'],
            target: '/spec/naver/webtoon/:titleId',
        },
    ],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const titleId = ctx.req.param('titleId');

    if (!titleId || !/^\d+$/.test(titleId)) {
        throw new InvalidParameterError('Invalid Naver Webtoon title ID. Use the numeric titleId from comic.naver.com/webtoon/list?titleId=:titleId.');
    }

    const apiUrl = `${NAVER_WEBTOON_ORIGIN}/webtoon/api/widget/episodeList?seriesTitleId=${titleId}`;

    const response = await cache.tryGet(buildCacheKey('naver-webtoon', titleId), () => ofetch<WebtoonApiResponse>(apiUrl), 24 * 60 * 60);

    const { bodies, titleInfo } = response as WebtoonApiResponse;

    if (!Array.isArray(bodies)) {
        throw new InvalidParameterError(`Naver Webtoon returned unexpected data for title ID "${titleId}". The API shape may have changed.`);
    }

    const feedTitle = titleInfo?.title ?? `Naver Webtoon ${titleId}`;

    const items: DataItem[] = bodies
        .filter((ep) => ep.thumbnail)
        .slice(0, EPISODE_PAGE_SIZE)
        .toReversed()
        .map((ep) => {
            const link = `${NAVER_WEBTOON_ORIGIN}/webtoon/detail?titleId=${titleId}&no=${ep.no}`;
            const pubDate = parseDate(ep.date);

            const extra: SpecExtraNaverWebtoon = {
                type: 'naver/webtoon/episode',
                platform: 'naver-webtoon',
                sourceUrl: link,
                externalId: String(ep.no),
                seriesExternalId: titleId,
                episodeLabel: `EP ${ep.no}`,
                publishedAt: pubDate ? pubDate.toISOString() : undefined,
                titleId,
                episodeNumber: ep.no,
                panelImageUrls: [],
            };

            return {
                title: ep.title,
                link,
                guid: `spec-naver-webtoon-${titleId}-${ep.no}`,
                pubDate,
                image: ep.thumbnail,
                description: ep.thumbnail ? `<img src="${ep.thumbnail}" />` : '',
                _extra: extra,
            };
        });

    return {
        title: `${feedTitle} — Naver Webtoon`,
        link: `${NAVER_WEBTOON_ORIGIN}/webtoon/list?titleId=${titleId}`,
        item: items,
        language: 'ko',
    };
}
