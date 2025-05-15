import got from '@/utils/got';
import { load } from 'cheerio';
import { getSFWNovelContent } from '../content/sfw';
import pixivUtils from '../../utils';
import { SeriesContentResponse, SeriesFeed } from './types';

const baseUrl = 'https://www.pixiv.net';

export async function getSFWSeriesNovels(seriesId: string, limit: number = 10): Promise<SeriesFeed> {
    const seriesPage = await got(`${baseUrl}/novel/series/${seriesId}`);
    const $ = load(seriesPage.data);

    const title = $('meta[property="og:title"]').attr('content') || '';
    const description = $('meta[property="og:description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || '';

    const response = await got(`${baseUrl}/ajax/novel/series/${seriesId}/content_titles`, {
        headers: {
            referer: `${baseUrl}/novel/series/${seriesId}`,
        },
    });

    const data = response.data as SeriesContentResponse;

    if (data.error) {
        throw new Error(data.message || 'Failed to get series data');
    }

    const chapters = data.body.slice(-Math.abs(limit));
    const chapterStartNum = Math.max(data.body.length - limit + 1, 1);

    const items = await Promise.all(
        chapters
            .map(async (chapter, index) => {
                if (!chapter.available) {
                    return {
                        title: `#${chapterStartNum + index} ${chapter.title}`,
                        description: `PIXIV_REFRESHTOKEN is required to view the full content.<br>需要 PIXIV_REFRESHTOKEN 才能查看完整內文。`,
                        link: `${baseUrl}/novel/show.php?id=${chapter.id}`,
                    };
                }

                const novelContent = await getSFWNovelContent(chapter.id);
                return {
                    title: `#${chapterStartNum + index} ${novelContent.title}`,
                    description: `
                    <img src="${pixivUtils.getProxiedImageUrl(novelContent.coverUrl)}" />
                    <div>
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
            .reverse()
    );

    return {
        title,
        description,
        image: pixivUtils.getProxiedImageUrl(image),
        link: `${baseUrl}/novel/series/${seriesId}`,
        item: items,
    };
}
