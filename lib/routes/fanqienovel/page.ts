import * as cheerio from 'cheerio';
import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface Chapter {
    itemId: string;
    needPay: number;
    title: string;
    isChapterLock: boolean;
    isPaidPublication: boolean;
    isPaidStory: boolean;
    volume_name: string;
    firstPassTime: string;
}

interface Page {
    hasFetch: boolean;
    author: string;
    authorId: string;
    bookId: string;
    mediaId: string;
    bookName: string;
    status: number;
    category: string;
    categoryV2: string;
    abstract: string;
    thumbUri: string;
    creationStatus: number;
    wordNumber: number;
    readCount: number;
    description: string;
    avatarUri: string;
    creatorId: string;
    lastPublishTime: string;
    lastChapterItemId: string;
    lastChapterTitle: string;
    volumeNameList: string[];
    chapterListWithVolume: Chapter[][];
    chapterTotal: number;
    followStatus: number;
    itemIds: string[];
    hasFetchDirectory: boolean;
    chapterList: any[];
    serverRendered: boolean;
    genre: string;
    platform: string;
    type: string;
    originalAuthors: string;
    completeCategory: string;
}

export const route: Route = {
    path: '/page/:bookId',
    example: '/fanqienovel/page/6621052928482348040',
    parameters: { bookId: '小说 ID，可在 URL 中找到' },
    maintainers: ['TonyRL'],
    name: '小说更新',
    handler,
    radar: [
        {
            source: ['fanqienovel.com/page/:bookId'],
        },
    ],
};

async function handler(ctx: Context): Promise<Data> {
    const { bookId } = ctx.req.param();
    const link = `https://fanqienovel.com/page/${bookId}`;

    const response = await ofetch(link);
    const $ = cheerio.load(response);

    const initialState = JSON.parse(
        $('script:contains("window.__INITIAL_STATE__")')
            .text()
            .match(/window\.__INITIAL_STATE__\s*=\s*(.*);/)?.[1] ?? '{}'
    );

    const page = initialState.page as Page;
    const items = page.chapterListWithVolume.flatMap((volume) =>
        volume.map((chapter) => ({
            title: chapter.title,
            link: `https://fanqienovel.com/reader/${chapter.itemId}`,
            description: chapter.volume_name,
            pubDate: parseDate(chapter.firstPassTime, 'X'),
            author: page.author,
        }))
    );

    return {
        title: `${page.bookName} - ${page.author}`,
        description: page.abstract,
        link,
        language: 'zh-CN',
        image: page.thumbUri,
        item: items,
    };
}
