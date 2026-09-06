import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://liuyan.people.com.cn';
const apiUrl = `${rootUrl}/threads/queryThreadsList`;
const allowedStates = new Set(['1', '2', '3', '4']);

type Message = {
    tid: number;
    subject: string;
    content: string;
    nickName: string;
    dateline: number;
    threadsCheckTime: number;
    forumName: string;
    typeName?: string;
    domainName?: string;
    stateInfo?: string;
    answerContent?: string | null;
    answerDateline?: number | null;
    answerOrganization?: string | null;
};

type ApiResponse = {
    result: string;
    responseData: Message[];
    success: boolean;
};

const formatText = (text: string) => text.replaceAll(/\r?\n/g, '<br>');

const getDescription = (message: Message) => {
    const content = `<p>${formatText(message.content)}</p>`;
    if (!message.answerContent) {
        return content;
    }

    const organization = message.answerOrganization ?? '官方回复';
    return `${content}<hr><p><strong>${organization}</strong></p><p>${formatText(message.answerContent)}</p>`;
};

export const route: Route = {
    path: '/liuyan/:id/:state?',
    categories: ['traditional-media'],
    example: '/people/liuyan/539',
    parameters: { id: '编号，可在对应人物页 URL 中找到', state: '状态，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '领导留言板',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    url: 'liuyan.people.com.cn/',
    description: `| 全部 | 待回复 | 办理中 | 已办理 |
| ---- | ------ | ------ | ------ |
| 1    | 2      | 3      | 4      |`,
};

async function handler(ctx) {
    const fid = ctx.req.param('id');
    if (!/^\d+$/.test(fid)) {
        throw new InvalidParameterError(`Invalid forum id '${fid}'`);
    }

    const state = ctx.req.param('state') ?? '1';
    if (!allowedStates.has(state)) {
        throw new InvalidParameterError(`Invalid state '${state}'`);
    }

    const limit = Number(ctx.req.query('limit') ?? 30);
    const forumUrl = `${rootUrl}/threads/list?fid=${fid}`;
    const currentUrl = `${forumUrl}#state=${state}`;
    const apiResponse = await ofetch<ApiResponse>(apiUrl, {
        method: 'POST',
        responseType: 'json',
        headers: {
            Referer: forumUrl,
        },
        body: new URLSearchParams({
            fid,
            state,
            lastItem: '0',
        }),
    });

    if (apiResponse.result !== 'success' || !apiResponse.success || !Array.isArray(apiResponse.responseData)) {
        throw new Error('Failed to fetch messages from the People’s Daily message board');
    }

    const items = apiResponse.responseData.slice(0, limit).map((message) => ({
        title: message.subject,
        author: message.nickName,
        link: `${rootUrl}/threads/content?tid=${message.tid}`,
        pubDate: parseDate(message.dateline * 1000),
        description: getDescription(message),
        category: [message.forumName, message.typeName, message.domainName, message.stateInfo].filter((category): category is string => Boolean(category)),
        ...(message.answerDateline && { updated: parseDate(message.answerDateline * 1000) }),
    }));

    return {
        title: `${apiResponse.responseData[0]?.forumName ?? `留言板 ${fid}`} - 领导留言板 - 人民网`,
        link: currentUrl,
        item: items,
    };
}
