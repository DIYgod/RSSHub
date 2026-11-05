import { load } from 'cheerio';
import queryString from 'query-string';

import cache from '@/utils/cache';
import { evaluateScriptCallback } from '@/utils/evaluate-script';
import { parseDate } from '@/utils/parse-date';
import { parseScriptSource } from '@/utils/parse-js';

import { maskHeader } from '../../constants';
import got from '../../pixiv-got';
import type { NovelContent, NSFWNovelDetail } from './types';
import { parseNovelContent } from './utils';

export async function getNSFWNovelContent(novelId: string, token: string): Promise<NovelContent> {
    return await cache.tryGet(`https://app-api.pixiv.net/webview/v2/novel:${novelId}`, async () => {
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

        const $ = load(response.data);
        const script = $('script')
            .toArray()
            .map((element) => $(element).text())
            .filter((source) => source.includes('pixiv'))
            .join('\n');
        if (!script) {
            throw new Error('No novel data found');
        }
        // The page defines its data with Object.defineProperty(window, 'pixiv', { value: { novel } }) among other
        // defineProperty calls, and the callback reader keeps the last call, so read only that statement
        const { program } = await parseScriptSource(script);
        const definition = program.body.find(
            (node) => node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression' && node.expression.arguments[1]?.type === 'Literal' && node.expression.arguments[1].value === 'pixiv'
        );
        const novelDetail = definition ? (await evaluateScriptCallback<{ value?: { novel?: NSFWNovelDetail } }>(script.slice(definition.start, definition.end), 'Object.defineProperty')).value?.novel : undefined;

        if (!novelDetail) {
            throw new Error('No novel data found');
        }

        const images = Object.fromEntries(
            Object.entries(novelDetail.images)
                .filter(([, image]) => image?.urls?.original)
                .map(([id, image]) => [id, image.urls.original])
        );

        const parsedContent = await parseNovelContent(novelDetail.text, images, token);

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
        };
    });
}
