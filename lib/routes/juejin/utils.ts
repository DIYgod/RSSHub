import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';
// import MarkdownIt from 'markdown-it';
// const md = MarkdownIt({
//     html: true,
// });
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

// 加载文章页
// async function loadContent(id) {
//     const response = await ofetch('https://api.juejin.cn/content_api/v1/article/detail', {
//         method: 'post',
//         body: {
//             article_id: id,
//         },
//     });
//     let description;
//     if (response.data) {
//         description = md.render(response.data.article_info.mark_content) || response.data.article_info.content;
//     }

//     return { description };
// }

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

// const loadNews = async (link) => {
//     const response = await ofetch(link);
//     const $ = cheerio.load(response);
//     $('h1.title, .main-box .message').remove();
//     return { description: $('.main-box .article').html() };
// };

export const parseList = (data) =>
    data.map((item) => {
        const isArticle = !!item.article_info;

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
                item.description = (await getArticle(item.link)) || item.description;

                return item;
            })
        )
    );

// export const ProcessFeed = (list, caches) =>
//     Promise.all(
//         list.map(async (item) => {
//             const isArticle = !!item.article_info;
//             const pubDate = parseDate((isArticle ? item.article_info.ctime : item.content_info.ctime) * 1000);
//             const link = `https://juejin.cn${isArticle ? '/post/' + item.article_id : '/news/' + item.content_id}`;
//             // 列表上提取到的信息
//             const single = {
//                 title: isArticle ? item.article_info.title : item.content_info.title,
//                 description: ((isArticle ? item.article_info.brief_content : item.content_info.brief) || '无描述').replaceAll(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ''),
//                 pubDate,
//                 author: item.author_user_info.user_name,
//                 link,
//             };

//             // 使用tryGet方法从缓存获取内容。
//             // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
//             const other = await caches.tryGet(link, () => (isArticle ? loadContent(item.article_id) : loadNews(link)));
//             // 合并解析后的结果集作为该篇文章最终的输出结果
//             return { ...single, ...other };
//         })
//     );

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
