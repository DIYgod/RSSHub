import { Data, Route, ViewType } from '@/types';
import type { Context } from 'hono';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import md5 from '@/utils/md5';
import path from 'node:path';
import { art } from '@/utils/render';

interface User {
    follow_type: number;
    investment_style_id: null | string;
    user_id: string;
    nickname: string;
    follow_status: number;
    faction_id: string;
    avatar: string;
    medal_count: number;
    style_str: null | string;
}

interface Stock {
    stock_id: string;
    name: string;
    code: string;
}

interface ResultItem {
    article_id: string;
    is_top: number;
    user_id: string;
    is_like: number;
    categoryIdSet: string[];
    source_id: null | string;
    title: string;
    subtitle: string;
    image: null | string;
    cover: null | string;
    url: null | string;
    type: number;
    read_limit: null | number;
    comment_count: number;
    collect_count: number;
    like_count: number;
    step_count: number;
    forward_count: number;
    integral: number;
    is_user_top: number;
    read_integral: number;
    read_limit_time: null | string;
    fans_limit: number;
    copy_limit: number;
    old_type: number;
    hide: number;
    create_time: string;
    is_make_word_cloud: number;
    sync_time: string;
    is_flatter: number;
    feature_img: null | string;
    interest_disclosure: number;
    new_interaction_time: string;
    sensitive_words: null | string;
    content: string;
    user: User;
    stock_list: Stock[];
}

interface CommunityData {
    pageNo: number;
    pageSize: number;
    orderBy: null | string;
    order: null | string;
    autoCount: boolean;
    map: Record<string, unknown>;
    params: string;
    result: ResultItem[];
    totalCount: number;
    first: number;
    totalPages: number;
    hasNext: boolean;
    nextPage: number;
    hasPre: boolean;
    prePage: number;
}

interface Community {
    msg: string;
    data: CommunityData;
    errCode: string;
    serverTime: number;
}

const render = (data) => art(path.join(__dirname, 'templates/community-description.art'), data);

export const route: Route = {
    path: '/community',
    categories: ['finance', 'popular'],
    view: ViewType.Articles,
    example: '/jiuyangongshe/community',
    maintainers: ['TonyRL'],
    name: '社群',
    handler,
    radar: [
        {
            source: ['www.jiuyangongshe.com'],
        },
    ],
};

async function handler(ctx: Context): Promise<Data> {
    const link = `https://www.jiuyangongshe.com`;

    const time = String(Date.now());
    const response = await ofetch<Community>('https://app.jiuyangongshe.com/jystock-app/api/v2/article/community', {
        method: 'POST',
        headers: {
            platform: '3',
            timestamp: time,
            token: md5(`Uu0KfOB8iUP69d3c:${time}`),
        },
        body: {
            category_id: '',
            limit: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit') as string, 10) : 30,
            order: 0,
            start: 1,
            type: 0,
            back_garden: 0,
        },
    });

    const items = response.data.result.map((item) => ({
        title: item.title,
        description: render({ cover: item.cover, content: item.content }),
        link: `${link}/a/${item.article_id}`,
        pubDate: timezone(parseDate(item.create_time, 'YYYY-MM-DD HH:mm:ss'), 8),
        author: item.user.nickname,
        category: item.stock_list.map((stock) => stock.name),
    }));

    return {
        title: '社群 - 韭研公社-研究共享，茁壮成长（原韭菜公社）',
        link,
        language: 'zh-CN',
        item: items,
    };
}
