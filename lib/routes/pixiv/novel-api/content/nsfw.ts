import { JSDOM, VirtualConsole } from 'jsdom';
import cache from '@/utils/cache';
import got from '../../pixiv-got';
import { maskHeader } from '../../constants';
import queryString from 'query-string';
import { parseNovelContent } from './utils';
import type { NovelContent, NSFWNovelDetail } from './types';
import { parseDate } from '@/utils/parse-date';
import { getNovelLanguage } from './common';

export async function getNSFWNovelContent(novelId: string, token: string): Promise<NovelContent> {
    return (await cache.tryGet(`https://app-api.pixiv.net/webview/v2/novel:${novelId}`, async () => {
        const response = await got('https://app-api.pixiv.net/webview/v2/novel', {
            headers: {
                ...maskHeader,
                Authorization: 'Bearer ' + token,
            },
            searchParams: queryString.stringify({
                id: novelId,
                viewer_version: '20221031_ai',
            }),
        });

        const virtualConsole = new VirtualConsole().on('error', () => void 0);

        const { window } = new JSDOM(response.data, {
            runScripts: 'dangerously',
            virtualConsole,
        });

        const novelDetail = window.pixiv?.novel as NSFWNovelDetail;

        window.close();

        if (!novelDetail) {
            throw new Error('No novel data found');
        }

        const images = Object.fromEntries(
            Object.entries(novelDetail.images)
                .filter(([, image]) => image?.urls?.original)
                .map(([id, image]) => [id, image.urls.original])
        );

        const parsedContent = await parseNovelContent(novelDetail.text, images, token);

        const language = await getNovelLanguage(novelId);

        return {
            id: novelDetail.id,
            title: novelDetail.title,
            description: novelDetail.caption,
            content: parsedContent,

            userId: novelDetail.userId,
            userName: null, // Not provided in NSFW API

            bookmarkCount: novelDetail.rating.bookmark,
            viewCount: novelDetail.rating.view,
            likeCount: novelDetail.rating.like,

            createDate: parseDate(novelDetail.cdate),
            updateDate: null, // Not provided in NSFW API

            isOriginal: novelDetail.isOriginal,
            aiType: novelDetail.aiType,
            tags: novelDetail.tags,

            coverUrl: novelDetail.coverUrl,
            images,

            seriesId: novelDetail.seriesId || null,
            seriesTitle: novelDetail.seriesTitle || null,

            language,
        };
    })) as NovelContent;
}
