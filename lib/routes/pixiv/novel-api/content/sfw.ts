import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import pixivUtils from '../../utils';
import type { NovelContent, SFWNovelDetail } from './types';
import { parseNovelContent } from './utils';

const baseUrl = 'https://www.pixiv.net';

export async function getSFWNovelContent(novelId: string): Promise<NovelContent> {
    const url = `${baseUrl}/ajax/novel/${novelId}`;
    return (await cache.tryGet(url, async () => {
        const response = await got(url, {
            headers: {
                referer: `${baseUrl}/novel/show.php?id=${novelId}`,
            },
        });

        const novelDetail = response.data as SFWNovelDetail;

        if (!novelDetail) {
            throw new Error('No novel data found');
        }

        const body = novelDetail.body;
        const images: Record<string, string> = {};

        if (novelDetail.body.textEmbeddedImages) {
            for (const [id, image] of Object.entries(novelDetail.body.textEmbeddedImages)) {
                images[id] = pixivUtils.getProxiedImageUrl(image.urls.original);
            }
        }

        const parsedContent = await parseNovelContent(novelDetail.body.content, images);

        return {
            id: body.id,
            title: body.title,
            description: body.description,
            content: parsedContent,

            userId: body.userId,
            userName: body.userName,

            bookmarkCount: body.bookmarkCount,
            viewCount: body.viewCount,
            likeCount: body.likeCount,

            createDate: parseDate(body.createDate),
            updateDate: parseDate(body.uploadDate),

            isOriginal: body.isOriginal,
            aiType: body.aiType,
            tags: body.tags.tags.map((tag) => tag.tag),

            coverUrl: body.coverUrl,
            images,

            seriesId: body.seriesNavData?.seriesId?.toString() || null,
            seriesTitle: body.seriesNavData?.title || null,
        };
    })) as NovelContent;
}
