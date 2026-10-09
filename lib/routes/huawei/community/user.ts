import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://cn.club.vmall.com';
const apiUrl = 'https://sgw-cn.c.huawei.com/forward/club/content_h5';

export const route: Route = {
    path: '/community/user/:uid?',
    example: '/huawei/community/user/1000014645695',
    name: '花粉俱乐部用户帖子',
    categories: ['program-update'],
    maintainers: ['DIYgod'],
    parameters: { uid: 'User ID from the public profile URL. Defaults to the official Mate/P software maintenance account (1000014645695).' },
    description: 'Includes public posts and their complete update notes. The default official account publishes device models, software versions, and release details.',
    radar: [{ source: ['cn.club.vmall.com/mhw/consumer/cn/community/mhwnews/bluevstore/id_:uid'], target: '/community/user/:uid' }],
    handler,
};

async function requestApi(path: string, body: object, appId: string) {
    const response = await ofetch(`${apiUrl}/${path}`, {
        method: 'POST',
        headers: { 'SGW-APP-ID': appId, Origin: baseUrl, Referer: `${baseUrl}/` },
        body,
    });
    if (String(response.errcode) !== '0' || !response.data) {
        throw new Error(`Huawei community did not return public data: ${response.errmsg || response.errMsg || 'check the user or post ID'}.`);
    }
    return response.data;
}

function getItem(post) {
    const link = post.threadShareUrl;
    return cache.tryGet(link, async () => {
        // Use the exact string ID from the share URL, since numeric thread IDs exceed Number.MAX_SAFE_INTEGER.
        const threadId = new URL(link).pathname.match(/id_(\d+)/)?.[1];
        if (!threadId) {
            throw new Error('Huawei community returned a post without an exact share ID.');
        }
        const detail = await requestApi('queryThreadDetail/1', { threadId, pageIndex: 1, pageSize: 20, orderBy: 1 }, '5881CD5912A8D0AA39AEC96F2EC2388A');
        const $ = load(detail.content || '', undefined, false);
        const references = detail.links || [];
        for (const reference of references) {
            const url = new URL(reference.path, baseUrl);
            if (['http:', 'https:'].includes(url.protocol)) {
                $(`link[id="${reference.id}"]`).replaceWith(
                    $('<a>')
                        .attr('href', url.href)
                        .text(reference.name || '查看原文')
                );
            }
        }
        const images = detail.imgInfoList || [];
        for (const image of images) {
            const element = $('<img>').attr('src', image.mediumPath || image.path);
            const placeholder = $(`img[id="${image.imgId}"]`);
            if (placeholder.length) {
                placeholder.replaceWith(element);
            } else {
                $.root().append(element);
            }
        }
        return {
            title: detail.subject || post.title,
            link,
            author: detail.authorInfo?.name || post.author,
            pubDate: detail.publishTime || post.dateline ? parseDate(detail.publishTime || post.dateline, 'x') : undefined,
            category: post.businessTypeName ? [post.businessTypeName] : undefined,
            description: `<div style="white-space: pre-wrap">${$.html()}</div>`,
        };
    });
}

async function handler(ctx) {
    const uid = ctx.req.param('uid') ?? '1000014645695';
    if (!/^\d+$/.test(uid)) {
        throw new InvalidParameterError('Use the numeric user ID from a Huawei community profile URL.');
    }
    const link = `${baseUrl}/mhw/consumer/cn/community/mhwnews/bluevstore/id_${uid}/`;
    const response = await requestApi('newsListByUserId/1', { site: 'zh_CN', userId: uid, pageSize: 20, curPage: 1 }, '9CE75DB648ADD4E0C1556B805C80D2CA');
    const posts = response.threads.slice(0, Number(ctx.req.query('limit')) || 20);
    const item = await pMap(posts, getItem, { concurrency: 3 });
    return { title: `${posts[0]?.author || uid} - 花粉俱乐部`, link, language: 'zh-CN' as const, item };
}
