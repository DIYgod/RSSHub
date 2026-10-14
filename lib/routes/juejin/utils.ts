import crypto from 'node:crypto';

import { load } from 'cheerio';
import { html } from 'hono/html';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { Category, Collection, Tag } from './types';

const b64tou8a = (str) => Uint8Array.from(Buffer.from(str, 'base64'));
const b64tohex = (str) => Buffer.from(str, 'base64').toString('hex');
const s256 = (s1: Uint8Array, s2: string) => {
    const sha = crypto.createHash('sha256');
    sha.update(s1);
    sha.update(s2);
    return sha.digest('hex');
};

/**
 * Solve _wafchallengeid
 *
 * `v` is the server-authored envelope that the signature covers:
 * - `a` is the hash prefix. It is bound to the client rather than random per challenge.
 * - `b` is the issue time, in unix seconds.
 * - `c` is the target digest, sha256 of `a` concatenated with the ASCII decimal of an `n` the server picked. Recovering `n` is the work, and it is usually below 10.
 * - `s` is a signature over `v` under a server-side key.
 *
 * Solving appends `d`, the base64 of the decimal `n`.
 *
 * @param cs - base64 encoded challenge string {"v":{"a":"...", "b":"timestamp", "c":"..."}, "s":"..."}
 * @returns base64 encoded solved challenge string {"v":{"a":"...", "b":"timestamp", "c":"..."}, "s":"...", "d":"solution"}
 */
export const solveWafChallenge = (cs: string) => {
    const c = JSON.parse(Buffer.from(cs, 'base64').toString());
    const prefix = b64tou8a(c.v.a);
    const expect = b64tohex(c.v.c);

    for (let i = 0; i < 1_000_000; i++) {
        const hash = s256(prefix, i.toString());
        if (hash === expect) {
            c.d = Buffer.from(i.toString()).toString('base64');
            break;
        }
    }
    return Buffer.from(JSON.stringify(c)).toString('base64');
};

const getArticle = async (link) => {
    let response = await ofetch(link);
    let $ = load(response);
    if ($('script').text().includes('_wafchallengeid')) {
        const cs = $('script:contains("_wafchallengeid")')
            .text()
            .match(/cs="(.*?)",c/)?.[1];
        const cookie = solveWafChallenge(cs!);

        response = await ofetch(link, {
            headers: {
                cookie: `_wafchallengeid=${cookie};`,
            },
        });

        $ = load(response);
    }

    return $('.article-viewer').html();
};

export const getShortMsgDescription = (msg, content = msg.content) => html`${content.split('\n').map((line) => html`${line}<br />`)}${(msg.pic_list ?? []).map((url) => html`<img src="${url}" />`)}`.toString();

export const parseList = (data) =>
    data.map((item) => {
        const isArticle = !!item.article_info;
        const isShortMsg = !!item.msg_Info;
        if (isShortMsg) {
            const msg = item.msg_Info;
            const contentMatches = msg.content.match(/\[(.*?)\]\s+(.*)/);
            return {
                title: contentMatches?.[1] ?? msg.content,
                description: getShortMsgDescription(msg, contentMatches?.[2] ?? msg.content),
                pubDate: parseDate(msg.ctime, 'X'),
                author: item.author_user_info.user_name,
                link: `https://juejin.cn/pin/${item.msg_id}`,
                category: item.topic?.title ? [item.topic.title] : undefined,
                isShortMsg: true,
            };
        }

        return {
            title: isArticle ? item.article_info.title : item.content_info.title,
            description: (isArticle ? item.article_info.brief_content : item.content_info.brief) || '无描述',
            pubDate: parseDate(isArticle ? item.article_info.ctime : item.content_info.ctime, 'X'),
            author: item.author_user_info.user_name,
            link: `https://juejin.cn${isArticle ? `/post/${item.article_id}` : `/news/${item.content_id}`}`,
            category: [...new Set([item.category.category_name, ...item.tags.map((tag) => tag.tag_name)])],
        };
    });

export const ProcessFeed = (list: Array<DataItem & { link: string; isShortMsg?: boolean }>) =>
    pMap(
        list,
        async ({ isShortMsg, ...item }) => ({
            ...item,
            description: isShortMsg ? item.description : (await cache.tryGet(`juejin:article:${item.link}`, () => getArticle(item.link))) || item.description,
        }),
        { concurrency: 3 }
    );

export const getCategoryBrief = () =>
    cache.tryGet('juejin:categoryBriefs', async () => {
        const response = await ofetch<{ data: Category[] }>('https://api.juejin.cn/tag_api/v1/query_category_briefs');
        return response.data;
    });

export const getCollection = (collectionId) =>
    cache.tryGet(`juejin:collectionId:${collectionId}`, async () => {
        const response = await ofetch<{ data: Collection | null; err_msg?: string }>('https://api.juejin.cn/interact_api/v1/collectionSet/get', {
            query: {
                tag_id: collectionId,
                cursor: 0,
            },
        });
        if (!response.data) {
            throw new Error(`Collection ${collectionId} is unavailable: ${response.err_msg ?? 'no data returned'}. Check that it exists and is public.`);
        }
        return response.data;
    });

export const getTag = (tag) =>
    cache.tryGet(`juejin:tag:${tag}`, async () => {
        const response = await ofetch<{ data: { tag_id: string; tag: Tag } }>('https://api.juejin.cn/tag_api/v1/query_tag_detail', {
            method: 'POST',
            body: {
                key_word: tag,
            },
        });
        return response.data;
    });

export const getTagList = () =>
    cache.tryGet('juejin:tagList', async () => {
        const response = await ofetch<{ data: Array<{ tag_id: string; tag: Tag }> }>('https://api.juejin.cn/tag_api/v1/query_tag_list', {
            method: 'POST',
            body: {
                key_word: '',
                status: [0],
                id_type: 1101,
                sort_type: 0,
                cursor: '0',
                limit: 100,
            },
        });
        return response.data;
    });
