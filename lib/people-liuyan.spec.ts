import type { Context } from 'hono';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import { route } from '@/routes/people/liuyan';
import type { Data } from '@/types';

const rootUrl = 'https://liuyan.people.com.cn';
const apiUrl = `${rootUrl}/threads/queryThreadsList`;
const forumUrl = `${rootUrl}/threads/list?fid=539`;

const baseItem = {
    tid: 1001,
    subject: '留言标题',
    content: '留言正文 <script>alert(1)</script>\n第二行',
    nickName: '网友甲',
    dateline: 1_785_000_000,
    threadsCheckTime: 1_785_000_100,
    forumName: '北京市委书记',
    typeName: '建言',
    domainName: '交通',
    stateInfo: '办理中',
    answerContent: null,
    answerDateline: null,
    answerOrganization: null,
};

function createCtx({ id, state, limit }: { id?: string; state?: string; limit?: string } = {}) {
    return {
        req: {
            param: (name: string) => ({ id, state })[name],
            query: (name: string) => (name === 'limit' ? limit : undefined),
        },
    } as unknown as Context;
}

async function registerApiMock(responseData: Array<Record<string, unknown>>, success = true, expectedState = '1') {
    const { default: server } = await import('@/setup.test');
    const response = { result: success ? 'success' : 'error', responseData, success };
    const detailRequest = vi.fn();

    server.use(
        http.post(apiUrl, async ({ request }) => {
            expect(request.headers.get('referer')).toBe(forumUrl);
            const form = await request.formData();
            expect(form.get('fid')).toBe('539');
            expect(form.get('state')).toBe(expectedState);
            expect(form.get('lastItem')).toBe('0');
            return new HttpResponse(JSON.stringify(response), {
                headers: { 'Content-Type': 'text/html;charset=UTF-8' },
            });
        }),
        http.post('http://liuyan.people.com.cn/threads/queryThreadsList', () => HttpResponse.json({}, { status: 500 })),
        http.get(`${rootUrl}/threads/content`, ({ request }) => {
            detailRequest(request.url);
            return HttpResponse.html('<div id="app"></div>');
        }),
        http.get('http://liuyan.people.com.cn/threads/content', ({ request }) => {
            detailRequest(request.url);
            return HttpResponse.html('<div id="app"></div>');
        })
    );

    return detailRequest;
}

describe('GET /people/liuyan/:id/:state?', () => {
    it('builds escaped feed items directly from the list API and applies limit', async () => {
        const detailRequest = await registerApiMock([
            baseItem,
            {
                ...baseItem,
                tid: 1002,
                subject: '第二条留言',
            },
        ]);

        const feed = (await route.handler(createCtx({ id: '539', limit: '1' }))) as Data;

        expect(feed.title).toBe('北京市委书记 - 领导留言板 - 人民网');
        expect(feed.link).toBe(`${forumUrl}#state=1`);
        expect(feed.item).toHaveLength(1);
        expect(feed.item?.[0]).toMatchObject({
            title: '留言标题',
            author: '网友甲',
            link: `${rootUrl}/threads/content?tid=1001`,
            category: ['北京市委书记', '建言', '交通', '办理中'],
        });
        expect(feed.item?.[0].description).toContain('留言正文 &lt;script&gt;alert(1)&lt;/script&gt;<br>第二行');
        expect(feed.item?.[0].description).not.toContain('<script>');
        expect(new Date(feed.item?.[0].pubDate ?? '').getTime()).toBe(baseItem.dateline * 1000);
        expect(detailRequest).not.toHaveBeenCalled();
    });

    it('passes a supported state to the API and feed link', async () => {
        await registerApiMock([baseItem], true, '3');

        const feed = (await route.handler(createCtx({ id: '539', state: '3' }))) as Data;

        expect(feed.link).toBe(`${forumUrl}#state=3`);
    });

    it('includes an official answer when the API provides one', async () => {
        await registerApiMock([
            {
                ...baseItem,
                answerContent: '回复内容\n下一行',
                answerDateline: 1_785_000_200,
                answerOrganization: '北京市交通委',
            },
        ]);

        const feed = (await route.handler(createCtx({ id: '539' }))) as Data;

        expect(feed.item?.[0].description).toContain('<strong>北京市交通委</strong>');
        expect(feed.item?.[0].description).toContain('回复内容<br>下一行');
        expect(new Date(feed.item?.[0].updated ?? '').getTime()).toBe(1_785_000_200_000);
    });

    it('requires a forum id instead of falling through to the generic People route', async () => {
        await expect(route.handler(createCtx())).rejects.toBeInstanceOf(InvalidParameterError);
        await expect(route.handler(createCtx())).rejects.toThrow('Forum id is required');
    });

    it('rejects a non-numeric forum id', async () => {
        await expect(route.handler(createCtx({ id: 'invalid' }))).rejects.toBeInstanceOf(InvalidParameterError);
        await expect(route.handler(createCtx({ id: 'invalid' }))).rejects.toThrow('Invalid forum id');
    });

    it('rejects an unsupported state', async () => {
        await expect(route.handler(createCtx({ id: '539', state: '9' }))).rejects.toBeInstanceOf(InvalidParameterError);
        await expect(route.handler(createCtx({ id: '539', state: '9' }))).rejects.toThrow('Invalid state');
    });

    it('reports an unsuccessful upstream response clearly', async () => {
        await registerApiMock([], false);

        await expect(route.handler(createCtx({ id: '539' }))).rejects.toThrow('Failed to fetch messages from the People’s Daily message board');
    });
});
