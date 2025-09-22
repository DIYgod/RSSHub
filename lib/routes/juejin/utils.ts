import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import crypto from 'node:crypto';
import cache from '@/utils/cache';
import { Category, Collection, Tag } from './types';

const b64tou8a = (str) => Uint8Array.from(Buffer.from(str, 'base64'));
const b64tohex = (str) => Buffer.from(str, 'base64').toString('hex');
const s256 = (s1: Uint8Array, s2: string) => {
    const sha = crypto.createHash('sha256');
    sha.update(s1);
    sha.update(s2);
    return sha.digest('hex');
};

const solveWafChallenge = (cs) => {
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

export const generateUuid = () => {
    const e = (t) => (t ? (t ^ ((16 * 0.5) >> (t / 4))).toString(10) : '10000000-1000-4000-8000-100000000000'.replaceAll(/[018]/g, e));
    return e().replaceAll('-', '').slice(0, 19);
};

export const getArticle = async (link) => {
    let response = await ofetch(link);
    let $ = cheerio.load(response);
    if ($('script').text().includes('_wafchallengeid')) {
        const cs = $('script:contains("_wafchallengeid")')
            .text()
            .match(/cs="(.*?)",c/)?.[1];
        const cookie = solveWafChallenge(cs);

        response = await ofetch(link, {
            headers: {
                cookie: `_wafchallengeid=${cookie};`,
            },
        });

        $ = cheerio.load(response);
    }

    return $('.article-viewer').html();
};

export const parseList = (data) =>
    data.map((item) => {
        const isArticle = !!item.article_info;
        const isShortMsg = !!item.msg_Info;
        if (isShortMsg) {
            const msg = item.msg_Info;
            const contentMatches = msg.content.match(/\[(.*?)\]\s+(.*)/);
            return {
                title: contentMatches?.[1],
                description: contentMatches?.[2]?.trim(),
                pubDate: parseDate(msg.ctime, 'X'),
                author: item.author_user_info.user_name,
                link: `https://juejin.cn/pin/7548882523352186915${item.msg_id}`,
                category: [item.topic.title],
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

export const ProcessFeed = (list) =>
    Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                item.description = item.isShortMsg ? item.description : (await getArticle(item.link)) || item.description;

                return item;
            })
        )
    );

export const getCategoryBrief = () =>
    cache.tryGet('juejin:categoryBriefs', async () => {
        const response = await ofetch('https://api.juejin.cn/tag_api/v1/query_category_briefs');
        return response.data;
    }) as Promise<Category[]>;

export const getCollection = (collectionId) =>
    cache.tryGet(`juejin:collectionId:${collectionId}`, async () => {
        const response = await ofetch('https://api.juejin.cn/interact_api/v1/collectionSet/get', {
            query: {
                tag_id: collectionId,
                cursor: 0,
            },
        });
        return response.data;
    }) as Promise<Collection>;

export const getTag = (tag) =>
    cache.tryGet(`juejin:tag:${tag}`, async () => {
        const response = await ofetch('https://api.juejin.cn/tag_api/v1/query_tag_detail', {
            method: 'POST',
            body: {
                key_word: tag,
            },
        });
        return response.data;
    }) as Promise<{ tag_id: string; tag: Tag }>;

export const getTagList = () =>
    cache.tryGet('juejin:tagList', async () => {
        const response = await ofetch('https://api.juejin.cn/tag_api/v1/query_tag_list', {
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
    }) as Promise<{ tag_id: string; tag: Tag }[]>;
