import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import timezone from '@/utils/timezone';

import { getTiebaPageContent } from './common';
import { parseRelativeTime } from './utils';

/**
 * 获取最新的帖子回复（倒序查看）
 *
 * @param {*} id 帖子ID
 * @param {number} [lz=0] 是否只看楼主（0: 查看全部, 1: 只看楼主）
 * @param {number} [pn=7e6] 帖子最大页码（默认假设为 7e6，如果超出假设则根据返回的最大页码再请求一次，否则可以节省一次请求）
 * 这个默认值我测试下来 7e6 是比较接近最大值了，因为当我输入 8e6 就会返回第一页的数据而不是最后一页了
 * @returns
 */
async function getPost(id: string, lz = 0, pn = 7e6) {
    const url = `https://tieba.baidu.com/p/${id}?see_lz=${lz}&pn=${pn}`;
    const html = await getTiebaPageContent(url, `tieba:post:${id}:${lz}:${pn}`, {
        waitForSelector: '.virtual-list-item',
        timeout: 3000,
    });

    const $ = load(html);
    const max = Number.parseInt($('[max-page]').attr('max-page') || '0');
    if (max > pn) {
        return getPost(id, lz, max);
    }
    return html;
}

export const route: Route = {
    path: ['/tieba/post/:id', '/tieba/post/lz/:id'],
    categories: ['bbs'],
    example: '/baidu/tieba/post/686961453',
    parameters: { id: '帖子 ID' },
    features: {
        requireConfig: [
            {
                name: 'BAIDU_COOKIE',
                optional: false,
                description: '百度 cookie 值，用于需要登录的贴吧页面',
            },
        ],
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['tieba.baidu.com/p/:id'],
        },
    ],
    name: '帖子动态',
    maintainers: ['u3u', 'FlanChanXwO'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const lz = ctx.req.path.includes('lz') ? 1 : 0;
    const html = await getPost(id, lz);
    const $ = load(html);

    const title = $('.pb-title-wrap .pb-title').text().trim() || '';

    // 使用新的 Vue 渲染页面选择器 - 只选择 virtual-list-item 避免重复
    const list = $('.virtual-list-item');

    if (list.length === 0) {
        throw new Error('No post replies found. The post may not exist or the cookie is invalid.');
    }

    return {
        title: lz ? `【只看楼主】${title}` : title,
        link: `https://tieba.baidu.com/p/${id}?see_lz=${lz}`,
        description: `${title}的最新回复`,
        item: list
            .toArray()
            .map((element) => {
                const item = $(element);

                // 作者名
                const authorName = item.find('.head-name').text().trim();

                // 跳过无效用户（无作者名的条目）
                if (!authorName) {
                    return null;
                }

                // 内容 - 从 pb-rich-text 获取（保留行内富文本，如链接、图片、表情等）
                const contentItems = item.find('.pb-rich-text .pb-content-item');
                let postContent = '';
                contentItems.each((_, el) => {
                    const html = $(el).html()?.trim();
                    if (html) {
                        postContent += `<p>${html}</p>`;
                    }
                });

                // 图片
                const images = item
                    .find('.image-list-wrapper img')
                    .toArray()
                    .map((img) => $(img).attr('src') || $(img).attr('data-src') || '')
                    .filter(Boolean)
                    .map((src) => `<img src="${src}" alt="${title}">`)
                    .join('');

                // 楼层和时间
                const descText = item.find('.pc-pb-comments-desc, .comment-desc-left').text().trim();
                const floorMatch = descText.match(/第(\d+)楼/);
                const floor = floorMatch ? `${floorMatch[1]}楼` : '';

                // 解析时间并验证有效性 - 使用完整的 descText 以支持 parseRelativeTime 能处理的所有格式
                const parsedDate = descText ? parseRelativeTime(descText) : null;
                const validPubDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? timezone(parsedDate, +8) : undefined;

                // 尝试获取回复的唯一ID用于生成直接链接
                const postId = item.attr('data-post-id') || item.attr('id') || '';
                const replyLink = postId ? `https://tieba.baidu.com/p/${id}?pid=${postId}#${postId}` : `https://tieba.baidu.com/p/${id}`;

                return {
                    title: `${authorName} 回复了帖子《${title}》`,
                    description: renderToString(
                        <>
                            {postContent ? <div>{raw(postContent)}</div> : null}
                            {images ? <div>{raw(images)}</div> : null}
                            {floor ? <p>楼层：{floor}</p> : null}
                        </>
                    ),

                    pubDate: validPubDate,
                    author: authorName,
                    link: replyLink,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null),
    };
}
