import got from '../../pixiv-got';
import { maskHeader } from '../../constants';
import { getNSFWNovelContent } from '../content/nsfw';
import pixivUtils from '../../utils';
import { SeriesDetail, SeriesFeed } from './types';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { getToken } from '../../token';
import { config } from '@/config';
import cache from '@/utils/cache';
import getNovelSeries from './common';

const baseUrl = 'https://www.pixiv.net';

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

    let appSeriesData = await getNovelSeries(seriesId, 0, token);
    if (appSeriesData.novel_series_detail.content_count > limit) {
        appSeriesData = await getNovelSeries(seriesId, appSeriesData.novel_series_detail.content_count - limit, token);
    }

    const items = await Promise.all(
        appSeriesData.novels.map(async (novel) => {
            const novelContent = await getNSFWNovelContent(novel.id, token);
            return {
                title: novelContent.title,
                description: `
                    <img src="${pixivUtils.getProxiedImageUrl(novelContent.coverUrl)}" />
                    <div lang="${novelContent.language}">
                    <p>${novelContent.description}</p>
                    <hr>
                    ${novelContent.content}
                    </div>
                `,
                link: `${baseUrl}/novel/show.php?id=${novelContent.id}`,
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
