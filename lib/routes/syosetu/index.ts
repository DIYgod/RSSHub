import { Route, Data, DataItem } from '@/types';
import { fetchNovelInfo, fetchChapterContent } from './utils';
import { Context } from 'hono';

export const route: Route = {
    path: '/:ncode',
    categories: ['reading'],
    example: '/syosetu/n1976ey',
    parameters: { ncode: 'Novel code, can be found in URL' },
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
            title: 'Novel',
            source: ['novel18.syosetu.com/:ncode', 'ncode.syosetu.com/:ncode'],
            target: '/:ncode',
        },
    ],
};

enum NovelType {
    Series = 1,
    Short = 2,
}

async function handler(ctx: Context): Promise<Data> {
    const { ncode } = ctx.req.param();
    const limit = Number.parseInt(ctx.req.query('limit') ?? '5');

    const { baseUrl, novel } = await fetchNovelInfo(ncode);
    novel.story = novel.story.replaceAll('\n', '<br>') || '';

    if (novel.noveltype === NovelType.Short) {
        const chapterUrl = `${baseUrl}/${ncode}/`;
        const item = await fetchChapterContent(chapterUrl);

        return {
            title: novel.title,
            description: novel.story,
            link: chapterUrl,
            item: [item] as DataItem[],
            language: 'ja',
        };
    }

    // if (novel.noveltype === NovelType.Series)
    const totalChapters = novel.general_all_no ?? 1;
    const startChapter = Math.max(totalChapters - limit + 1, 1);

    const items = await Promise.all(
        Array.from({ length: Math.min(limit, totalChapters) }, async (_, index) => {
            const chapterNumber = startChapter + index;
            const chapterUrl = `${baseUrl}/${ncode}/${chapterNumber}/`;

            const item = await fetchChapterContent(chapterUrl);
            return item;
        }).reverse()
    );

    return {
        title: novel.title,
        description: novel.story,
        link: `${baseUrl}/${ncode}/`,
        item: items as DataItem[],
        language: 'ja',
    };
}
