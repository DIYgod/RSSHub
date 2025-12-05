import queryString from 'query-string';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import cache from '@/utils/cache';

import { maskHeader } from '../../constants';
import got from '../../pixiv-got';
import { getToken } from '../../token';
import pixivUtils from '../../utils';
import { getNSFWNovelContent } from '../content/nsfw';
import type { AppNovelSeries, SeriesDetail, SeriesFeed } from './types';

const baseUrl = 'https://www.pixiv.net';

async function getNovelSeries(seriesId: string, offset: number, token: string): Promise<AppNovelSeries> {
    const rsp = await got('https://app-api.pixiv.net/v2/novel/series', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            series_id: seriesId,
            last_order: offset,
        }),
    });
    return rsp.data as AppNovelSeries;
}

export async function getNSFWSeriesNovels(seriesId: string, limit: number = 10): Promise<SeriesFeed> {
    if (limit > 30) {
        limit = 30;
    }

    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new ConfigNotFoundError('This user is an R18 creator, PIXIV_REFRESHTOKEN is required.\npixiv RSS is disabled due to the lack of relevant config.\n該用戶爲 R18 創作者，需要 PIXIV_REFRESHTOKEN。');
    }

    const token = await getToken(cache.tryGet);
    if (!token) {
        throw new ConfigNotFoundError('pixiv not login');
    }

    const seriesResponse = await got(`${baseUrl}/ajax/novel/series/${seriesId}`, {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
    });
    const seriesData = seriesResponse.data as SeriesDetail;

    let offset = seriesData.body.total - limit;
    if (offset < 0) {
        offset = 0;
    }
    const appSeriesData = await getNovelSeries(seriesId, offset, token);

    const items = await Promise.all(
        appSeriesData.novels.map(async (novel) => {
            const novelContent = await getNSFWNovelContent(novel.id, token);
            return {
                title: novel.title,
                description: `
                    <img src="${pixivUtils.getProxiedImageUrl(novelContent.coverUrl)}" />
                    <div>
                    <p>${novelContent.description}</p>
                    <hr>
                    ${novelContent.content}
                    </div>
                `,
                link: `${baseUrl}/novel/show.php?id=${novel.id}`,
                pubDate: novel.create_date,
                author: novel.user.name,
                category: novelContent.tags,
            };
        })
    );

    return {
        title: appSeriesData.novel_series_detail.title,
        description: appSeriesData.novel_series_detail.caption,
        link: `${baseUrl}/novel/series/${seriesId}`,
        image: pixivUtils.getProxiedImageUrl(seriesData.body.cover.urls.original),
        item: items,
    };
}
