import { Route, Data, DataItem } from '@/types';
import { fetchNovelInfo, fetchChapterContent } from './utils';
import { Context } from 'hono';
import { NovelType } from 'narou';

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
    const limit = Math.min(Number(ctx.req.query('limit') ?? 5), 20);

    const { baseUrl, novel } = await fetchNovelInfo(ncode);
    novel.story = novel.story.replaceAll('\n', '<br>') || '';

    // Tanpen = Short
    if (novel.noveltype === NovelType.Tanpen) {
        const chapterUrl = `${baseUrl}/${ncode}`;
        const item = await fetchChapterContent(chapterUrl);

        // Shorts are updated rather than having new chapters
        // Use novelupdated_at as pubDate since RSS 2.0 doesn't have updated field
        item.pubDate = novel.novelupdated_at;

        return {
            title: novel.title,
            description: novel.story,
            link: chapterUrl,
            item: [item] as DataItem[],
            language: 'ja',
        };
    }

    // Rensai = Series
    // if (novel.noveltype === NovelType.Rensai)
    const totalChapters = novel.general_all_no ?? 1;
    const startChapter = Math.max(totalChapters - limit + 1, 1);

    const items = await Promise.all(
        Array.from({ length: Math.min(limit, totalChapters) }, async (_, index) => {
            const chapterNumber = startChapter + index;
            const chapterUrl = `${baseUrl}/${ncode}/${chapterNumber}`;

            const item = await fetchChapterContent(chapterUrl, chapterNumber);
            return item;
        }).reverse()
    );

    return {
        title: novel.title,
        description: novel.story,
        link: `${baseUrl}/${ncode}`,
        item: items as DataItem[],
        language: 'ja',
    };
}
