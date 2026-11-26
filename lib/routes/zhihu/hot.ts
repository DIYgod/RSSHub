import pMap from 'p-map';

import { config } from '@/config';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import type { HotAnswerEntry } from './templates/hot';
import { renderHotDescription } from './templates/hot';
import { header, processImage } from './utils';

const HOT_LIST_URL = 'https://api.zhihu.com/topstory/hot-lists/total?limit=10&reverse_order=0';
const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 50;
const TOP_ANSWERS_LIMIT = 3;
const ANSWER_CONCURRENCY = 5;
const ANSWER_INCLUDE = 'data[*].is_normal,content,excerpt,voteup_count,author.name';

interface ZhihuHotTarget {
    id?: number | string;
    title?: string;
    url?: string;
    type?: string;
    created?: number;
    author?: {
        name?: string;
    };
    excerpt?: string;
}

interface ZhihuHotChild {
    thumbnail?: string;
}

interface ZhihuHotEntry {
    target?: ZhihuHotTarget;
    children?: ZhihuHotChild[];
}

interface ZhihuHotResponse {
    data?: ZhihuHotEntry[];
}

interface ZhihuAnswerRaw {
    id?: number | string;
    url?: string;
    is_normal?: boolean;
    content?: string;
    excerpt?: string;
    voteup_count?: number;
    author?: {
        name?: string;
    };
}

interface ZhihuAnswerResponse {
    data?: ZhihuAnswerRaw[];
}

const hasAuthCookie = (cookie: string | undefined): boolean =>
    Boolean(
        cookie?.split(';').some((part) => {
            const trimmed = part.trim();
            return trimmed.startsWith('z_c0=') && trimmed.length > 5;
        })
    );

const extractQuestionId = (target: ZhihuHotTarget): string => {
    if (target.url) {
        const matched = target.url.match(/\/questions\/(\d+)/);
        if (matched?.[1]) {
            return matched[1];
        }
        const segment = target.url.split('/').pop();
        if (segment) {
            return segment;
        }
    }
    return target.id === undefined ? '' : String(target.id);
};

const isSafeHttpUrl = (value: string | undefined): value is string => {
    if (!value) {
        return false;
    }
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
        return false;
    }
};

const toPositiveVoteCount = (value: number | undefined): number => (typeof value === 'number' && value > 0 ? value : 0);

const resolveAnswerBody = (answer: ZhihuAnswerRaw) => {
    if (answer.content?.trim()) {
        return { contentHtml: processImage(answer.content) };
    }
    if (answer.excerpt?.trim()) {
        return { excerptText: answer.excerpt };
    }
};

const extractAnswerId = (answer: ZhihuAnswerRaw): string => {
    const matched = answer.url?.match(/\/answers\/(\d+)/);
    if (matched?.[1]) {
        return matched[1];
    }
    return answer.id === undefined ? '' : String(answer.id);
};

const normalizeAnswer = (answer: ZhihuAnswerRaw, questionId: string): HotAnswerEntry | undefined => {
    const id = extractAnswerId(answer);
    if (answer.is_normal === false || !id) {
        return undefined;
    }
    const body = resolveAnswerBody(answer);
    if (!body) {
        return undefined;
    }
    return {
        id,
        author: answer.author?.name || '知乎用户',
        voteupCount: toPositiveVoteCount(answer.voteup_count),
        link: `https://www.zhihu.com/question/${questionId}/answer/${id}`,
        ...body,
    };
};

const requestTopAnswers = async (questionId: string, cookie: string): Promise<ZhihuAnswerResponse> => {
    const url = `https://www.zhihu.com/api/v4/questions/${questionId}/answers`;
    const options = {
        query: {
            include: ANSWER_INCLUDE,
            limit: String(TOP_ANSWERS_LIMIT),
            offset: '0',
            sort_by: 'default',
            platform: 'desktop',
        },
        headers: {
            ...header,
            Cookie: cookie,
            Referer: `https://www.zhihu.com/question/${questionId}`,
        },
    };
    try {
        return await ofetch<ZhihuAnswerResponse>(url, options);
    } catch {
        return await ofetch<ZhihuAnswerResponse>(url, options);
    }
};

const fetchTopAnswers = async (questionId: string, cookie: string): Promise<HotAnswerEntry[]> => {
    try {
        const cached = await cache.tryGet<HotAnswerEntry[]>(
            `zhihu:hot:answers:${questionId}`,
            async () => {
                const response = await requestTopAnswers(questionId, cookie);
                const answers = (response.data ?? []).map((answer) => normalizeAnswer(answer, questionId)).filter((answer): answer is HotAnswerEntry => Boolean(answer));
                if (answers.length === 0) {
                    throw new Error('No readable answers returned');
                }
                return answers;
            },
            config.cache.contentExpire,
            false
        );
        return cached ?? [];
    } catch {
        return [];
    }
};

const shouldFetchQuestionAnswers = (target: ZhihuHotTarget, questionId: string, cookie: string | undefined, canFetchAnswers: boolean): cookie is string => {
    const isQuestion = !target.type || target.type === 'question';
    return canFetchAnswers && Boolean(cookie) && isQuestion && /^\d+$/.test(questionId);
};

const attachOptionalMetadata = (item: DataItem, target: ZhihuHotTarget, thumbnail: string | undefined) => {
    if (target.author?.name) {
        item.author = target.author.name;
    }
    if (typeof target.created === 'number' && target.created > 0) {
        item.pubDate = parseDate(target.created * 1000);
    }
    if (isSafeHttpUrl(thumbnail)) {
        item.image = thumbnail;
    }
};

const buildHotItem = async (entry: ZhihuHotEntry, cookie: string | undefined, canFetchAnswers: boolean): Promise<DataItem | undefined> => {
    const target = entry.target;
    const questionId = target?.title ? extractQuestionId(target) : '';
    if (!target?.title || !questionId) {
        return undefined;
    }
    const answers = shouldFetchQuestionAnswers(target, questionId, cookie, canFetchAnswers) ? await fetchTopAnswers(questionId, cookie) : [];
    const item: DataItem = {
        link: `https://www.zhihu.com/question/${questionId}`,
        title: target.title,
        description: renderHotDescription({
            excerpt: target.excerpt ?? '',
            answers,
        }),
    };
    attachOptionalMetadata(item, target, entry.children?.[0]?.thumbnail);
    return item;
};

export const route: Route = {
    path: '/hot/:category?',
    categories: ['social-media'],
    example: '/zhihu/hot',
    view: ViewType.Articles,
    features: {
        requireConfig: [
            {
                name: 'ZHIHU_COOKIES',
                description: 'Optional Zhihu cookie containing `z_c0` to include top answers for each hot question.',
                optional: true,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '热榜',
    maintainers: ['nczitzk', 'pseudoyu', 'DIYgod'],
    handler,
};

async function handler(ctx): Promise<Data | null> {
    const category = ctx.req.param('category');
    if (category) {
        ctx.set('redirect', '/zhihu/hot');
        return null;
    }

    const cookie = config.zhihu.cookies;
    const canFetchAnswers = hasAuthCookie(cookie);
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), MAX_LIMIT);

    const response = await ofetch<ZhihuHotResponse>(HOT_LIST_URL, {
        headers: cookie ? { Cookie: cookie } : undefined,
    });

    const entries = (response.data ?? []).slice(0, limit);
    const items = await pMap(entries, (entry) => buildHotItem(entry, cookie, canFetchAnswers), {
        concurrency: ANSWER_CONCURRENCY,
    });

    return {
        title: '知乎热榜',
        link: 'https://www.zhihu.com/hot',
        item: items.filter((item): item is DataItem => Boolean(item)),
    };
}
