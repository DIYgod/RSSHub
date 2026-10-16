import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { apiUrl, getBoards, renderDesc, rootUrl, token } from './utils';

export const route: Route = {
    path: '/student5/:board?',
    categories: ['bbs'],
    example: '/zuvio/student5/34',
    parameters: { board: '看板 ID，空为全站文章，可在看板 URL 或下方路由找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '校園話題',
    maintainers: ['TonyRL'],
    handler,
};

const getPublicationDate = (value?: string): Date | undefined => {
    if (typeof value !== 'string' || !/\S/.test(value)) {
        return undefined;
    }
    const date = timezone(parseDate(value), 8);
    return Number.isFinite(date.getTime()) ? date : undefined;
};

async function handler(ctx): Promise<Data> {
    const { board = '' } = ctx.req.param();
    const selectedBoard = board ? (await getBoards()).find((item) => item.boardId === board) : undefined;
    if (board && !selectedBoard) {
        throw new InvalidParameterError(`Unknown board '${board}'. Find available board IDs at /zuvio/student5/boards.`);
    }
    const title = selectedBoard?.title ?? '全部';

    const { data } = await got(`${apiUrl}/article`, {
        searchParams: {
            api_token: token,
            user_id: '0',
            board_id: board,
            sort: 'time',
            page: '1',
            device: 'web',
            my_school_opinion: '1',
        },
    });

    let items = data.articles.map((item) => ({
        title: item.title,
        description: item.abstract,
        pubDate: getPublicationDate(item.created_at),
        link: `${rootUrl}/article/${item.id}`,
        api: `${apiUrl}/article/${item.id}`,
        author: `${item.university} ${item.user_name}`,
        category: item.board_name,
    }));

    items = await pMap(
        items,
        async (item: (typeof items)[number]) => {
            const { api, ...metadata } = item;
            const detail = await cache.tryGet<Pick<DataItem, 'description'>>(`zuvio:detail:v5:${item.link}`, async () => {
                const { data } = await got(api, {
                    searchParams: {
                        api_token: token,
                        user_id: '0',
                        device: 'web',
                        ref: '',
                    },
                });
                return { description: renderDesc(data) };
            });
            return { ...metadata, description: detail.description };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: `Zuvio 校園${title}話題 - 大學生論壇`,
        description: 'Zuvio 校園話題千種動物頭像交流心得。最萌的匿名論壇，上千種逗趣動物頭像隨你變換，點頭像立即私訊功能，讓你找到共同話題的小夥伴！多人分享配對心得、聊天交友心情在此，快加入17分享！',
        image: 'https://s3.hicloud.net.tw/zuvio.public/public/system/images/irs_v4/chicken/shared/webshare.png',
        link: `${rootUrl}/articles`,
        item: items,
        language: 'zh-Hant' as Language,
    };
}
