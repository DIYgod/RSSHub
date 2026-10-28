import type { Context } from 'hono';
import { NovelType } from 'narou';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { fetchChapterContent, fetchChapterPublicationDates, fetchNovelInfo, getNovelDates } from './utils';

export const route: Route = {
    path: '/:ncode',
    categories: ['reading'],
    example: '/syosetu/n9292ii',
    parameters: {
        ncode: 'Novel code, can be found in URL',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Novel Updates',
    maintainers: ['eternasuno', 'SnowAgar25'],
    handler,
    radar: [
        {
            title: 'Novel Updates',
            source: ['ncode.syosetu.com/:ncode', 'ncode.syosetu.com/:ncode/:chapter'],
            target: '/:ncode',
        },
        {
            title: 'Novel Updates',
            source: ['novel18.syosetu.com/:ncode', 'novel18.syosetu.com/:ncode/:chapter'],
            target: '/:ncode',
        },
    ],
};

async function handler(ctx: Context): Promise<Data> {
    const { ncode } = ctx.req.param();
    const limit = Math.min(getRouteLimit(ctx, 5) ?? 5, 20);

    const { baseUrl, novel } = await fetchNovelInfo(ncode);
    novel.story = novel.story.replaceAll('\n', '<br>') || '';

    // Tanpen = Short
    if (novel.noveltype === NovelType.Tanpen) {
        const chapterUrl = `${baseUrl}/${ncode}`;
        const item = await fetchChapterContent(chapterUrl);

        return {
            title: novel.title,
            description: novel.story,
            link: chapterUrl,
            item: [{ ...item, ...getNovelDates(novel) }],
            language: 'ja',
        };
    }

    // Rensai = Series
    // if (novel.noveltype === NovelType.Rensai)
    const totalChapters = novel.general_all_no ?? 1;
    const startChapter = Math.max(totalChapters - limit + 1, 1);
    const chapterDates = await fetchChapterPublicationDates(`${baseUrl}/${ncode}/`);

    const items = await pMap(
        Array.from({ length: Math.min(limit, totalChapters) }, (_, index) => startChapter + index).toReversed(),
        async (chapterNumber) => {
            const chapterUrl = `${baseUrl}/${ncode}/${chapterNumber}`;

            const item = await fetchChapterContent(chapterUrl, chapterNumber);
            return { ...item, pubDate: chapterDates.get(chapterUrl) ?? item.pubDate };
        },
        { concurrency: 3 }
    );

    return {
        title: novel.title,
        description: novel.story,
        link: `${baseUrl}/${ncode}`,
        item: items,
        language: 'ja',
    };
}
