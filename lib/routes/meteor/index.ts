import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, getBoards, renderDesc } from './utils';

export const route: Route = {
    path: '/:board?',
    categories: ['bbs'],
    example: '/meteor/all',
    parameters: { board: '看板 ID 或簡稱，可在 URL 或下方路由找到，預設為 `all`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '看板',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    let { board = 'all' } = ctx.req.param();
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 30;

    const boards = await getBoards();
    let boardInfo;
    if (board !== 'all') {
        boardInfo = boards.find((b) => b.id === board || b.alias === board);
        if (!boardInfo) {
            throw new InvalidParameterError(`Unknown board: ${board}. Use /meteor/boards to find a board ID or alias.`);
        }
        board = boardInfo.id;
    }

    const response = await ofetch(`${baseUrl}/article/get_new_articles`, {
        method: 'POST',
        body: {
            boardId: board,
            isCollege: false,
            page: 0,
            pageSize: limit,
        },
    });

    const result = JSON.parse(decodeURIComponent(response.result));

    const items = result.map((item) => ({
        title: item.title,
        description: renderDesc(item.content),
        link: `${baseUrl}/article/${item.shortId}`,
        author: item.authorAlias,
        pubDate: parseDate(item.createdAt),
        category: item.tagNameList,
    }));

    return {
        title: `${board === 'all' ? '全部看板' : boardInfo.title} | Meteor 學生社群`,
        description: board === 'all' ? undefined : boardInfo.feedDescription,
        image: board === 'all' || boardInfo.imgUrl === 'not_set' ? undefined : boardInfo.imgUrl,
        link: `${board === 'all' ? `${baseUrl}/board/all` : boardInfo.link}/new`,
        item: items,
    };
}
