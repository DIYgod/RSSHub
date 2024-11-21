import got from '../../pixiv-got';
import { maskHeader } from '../../constants';
import { getNSFWNovelContent } from '../content/nsfw';
import pixivUtils from '../../utils';
import { SeriesContentResponse, SeriesDetail, SeriesFeed } from './types';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { getToken } from '../../token';
import { config } from '@/config';
import cache from '@/utils/cache';

const baseUrl = 'https://www.pixiv.net';

export async function getNSFWSeriesNovels(seriesId: string, limit: number = 10): Promise<SeriesFeed> {
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

    if (seriesData.error) {
        throw new Error(seriesData.message || 'Failed to get series detail');
    }

    // Get chapters
    const chaptersResponse = await got(`${baseUrl}/ajax/novel/series/${seriesId}/content_titles`, {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
    });

    const data = chaptersResponse.data as SeriesContentResponse;

    if (data.error) {
        throw new Error(data.message || 'Failed to get series data');
    }

    const chapters = data.body.slice(-Math.abs(limit));
    const chapterStartNum = Math.max(data.body.length - limit + 1, 1);

    const items = await Promise.all(
        chapters.map(async (chapter, index) => {
            const novelContent = await getNSFWNovelContent(chapter.id, token);
            return {
                title: `#${chapterStartNum + index} ${novelContent.title}`,
                description: `
                    <img src="${pixivUtils.getProxiedImageUrl(novelContent.coverUrl)}" />
                    <div lang="${novelContent.language}">
                    <p>${novelContent.description}</p>
                    <hr>
                    ${novelContent.content}
                    </div>
                `,
                link: `${baseUrl}/novel/show.php?id=${novelContent.id}`,
                pubDate: novelContent.createDate,
                author: novelContent.userName || `User ID: ${novelContent.userId}`,
                category: novelContent.tags,
            };
        })
    );

    return {
        title: seriesData.body.title,
        description: seriesData.body.caption,
        link: `${baseUrl}/novel/series/${seriesId}`,
        image: pixivUtils.getProxiedImageUrl(seriesData.body.cover.urls.original),
        item: items,
    };
}
