import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';

export const route: Route = {
    path: '/comic/:id',
    categories: ['anime'],
    example: '/komiic/comic/533',
    parameters: { id: '漫画 ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['komiic.com/comic/:id'],
            target: '/comic/:id',
        },
    ],
    name: '漫画更新',
    maintainers: ['NekoAria'],
    handler,
};

async function handler(ctx) {
    const { id } = ctx.req.param();
    const { limit = 0 } = ctx.req.query();
    const baseUrl = 'https://komiic.com';

    const { data: comicInfo } = await got.post(`${baseUrl}/api/query`, {
        json: {
            operationName: 'comicById',
            variables: { comicId: id },
            query: `query comicById($comicId: ID!) {
                comicById(comicId: $comicId) {
                    title
                    imageUrl
                }
            }`,
        },
    });

    const { title, imageUrl } = comicInfo.data.comicById;

    const { data: chapterData } = await got.post(`${baseUrl}/api/query`, {
        json: {
            operationName: 'chapterByComicId',
            variables: { comicId: id },
            query: `query chapterByComicId($comicId: ID!) {
                chaptersByComicId(comicId: $comicId) {
                    id
                    serial
                    type
                    dateUpdated
                    size
                }
            }`,
        },
    });

    const sortedChapters = chapterData.data.chaptersByComicId.toSorted((a, b) => Date.parse(b.dateUpdated) - Date.parse(a.dateUpdated));

    const chapterLimit = Number(limit) || sortedChapters.length;
    const filteredChapters = sortedChapters.slice(0, chapterLimit);

    const generateChapterDescription = (chapter) =>
        `
        <h1>${chapter.size}p</h1>
        <img src="${imageUrl}" />
    `.trim();

    const items = filteredChapters.map((chapter) => ({
        title: chapter.type === 'book' ? `第 ${chapter.serial} 卷` : `第 ${chapter.serial} 话`,
        link: `${baseUrl}/comic/${id}/chapter/${chapter.id}/images/all`,
        pubDate: parseDate(chapter.dateUpdated),
        description: generateChapterDescription(chapter),
    }));

    return {
        title: `Komiic - ${title}`,
        link: `${baseUrl}/comic/${id}`,
        item: items,
    };
}
