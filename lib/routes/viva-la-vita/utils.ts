import { encodeXML } from 'entities';
import pMap, { pMapSkip } from 'p-map';

import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://bbs.viva-la-vita.org';
const commentLimit = 5;

interface Reference {
    type: string;
    id: string;
}

interface User {
    type: 'users';
    id: string;
    attributes: { displayName?: string; username: string };
}

interface Tag {
    type: 'tags';
    id: string;
    attributes: { name: string };
}

interface Post {
    type: 'posts';
    id: string;
    attributes: {
        number: number;
        contentType: string;
        contentHtml?: string;
        createdAt: string;
        hiddenAt?: string;
        isHidden?: boolean;
        isApproved?: boolean;
    };
    relationships?: { user?: { data: Reference | null } };
}

interface Discussion {
    type: 'discussions';
    id: string;
    attributes: {
        title: string;
        createdAt: string;
    };
    relationships: {
        firstPost: { data: Reference | null };
        user?: { data: Reference | null };
        tags?: { data: Reference[] };
    };
}

interface ApiResponse<T> {
    data: T;
    included?: (Post | User | Tag)[];
}

const feeds = {
    latest: { title: '最新帖子', sort: '-createdAt', websiteSort: 'newest' },
    featured: { title: '精华帖子', sort: '-frontdate', websiteSort: 'front' },
    hot: { title: '热门帖子', sort: '-commentCount', websiteSort: 'top' },
} as const;

export const feedDescription =
    '读取榜单前 20 个主题，跳过首帖不可见的主题，包含首帖正文及最新 5 条公开评论（新到旧，不含首帖及系统事件）。评论缓存 5 分钟，无需登录。主题链接、GUID 和发布时间在各路由中保持一致，不因排名、加精、编辑或回复而生成新条目；新增评论只更新原条目内容。是否重新通知以及跨订阅去重取决于阅读器。';

function isVisibleComment(post: Post): boolean {
    return post.attributes.contentType === 'comment' && !post.attributes.hiddenAt && !post.attributes.isHidden && post.attributes.isApproved !== false && typeof post.attributes.contentHtml === 'string';
}

function userMap(included: (Post | User | Tag)[] = []): Map<string, User> {
    return new Map(included.filter((resource): resource is User => resource.type === 'users').map((user) => [user.id, user]));
}

function authorName(reference: Reference | null | undefined, users: Map<string, User>): string {
    const user = reference && users.get(reference.id);
    return user ? user.attributes.displayName || user.attributes.username : '已注销用户';
}

function renderComment(post: Post, discussionId: string, users: Map<string, User>): string {
    const author = encodeXML(authorName(post.relationships?.user?.data, users));
    const date = encodeXML(post.attributes.createdAt);
    const link = `${baseUrl}/d/${discussionId}/${post.attributes.number}`;
    return `<section><p><a href="${link}">#${post.attributes.number}</a> · ${author} · <time datetime="${date}">${date}</time></p>${post.attributes.contentHtml}</section>`;
}

async function discussionItem(discussion: Discussion, included: (Post | User | Tag)[]): Promise<DataItem | typeof pMapSkip> {
    const link = `${baseUrl}/d/${discussion.id}`;
    const firstPostId = discussion.relationships.firstPost.data?.id;
    const firstPost = included.find((resource): resource is Post => resource.type === 'posts' && resource.id === firstPostId);
    if (!firstPost || !isVisibleComment(firstPost)) {
        // Some public ranking entries have a deleted or inaccessible first post.
        return pMapSkip;
    }

    // Use an expiring, non-sliding cache: replies and edits must not be cached indefinitely.
    const replies = await cache.tryGet(
        `${link}:latest-comments`,
        () =>
            ofetch<ApiResponse<Post[]>>(`${baseUrl}/api/posts`, {
                query: {
                    'filter[discussion]': discussion.id,
                    'filter[type]': 'comment',
                    sort: '-number',
                    'page[limit]': commentLimit + 1,
                    include: 'user',
                },
            }),
        300,
        false
    );
    const comments = replies.data
        .filter((post) => post.id !== firstPostId && post.attributes.number !== 1 && isVisibleComment(post))
        .sort((a, b) => b.attributes.number - a.attributes.number)
        .slice(0, commentLimit);
    const replyUsers = userMap(replies.included);
    const commentHtml = comments.length ? comments.map((post) => renderComment(post, discussion.id, replyUsers)).join('') : '<p>暂无公开评论。</p>';
    const users = userMap(included);
    const tagIds = new Set(discussion.relationships.tags?.data.map((tag) => tag.id));
    const category = included.filter((resource): resource is Tag => resource.type === 'tags' && tagIds.has(resource.id)).map((tag) => tag.attributes.name);

    return {
        title: discussion.attributes.title,
        link,
        guid: link,
        author: authorName(discussion.relationships.user?.data || firstPost.relationships?.user?.data, users),
        pubDate: parseDate(discussion.attributes.createdAt),
        // Keep Atom's entry timestamp stable as well: activity is not a new publication.
        updated: parseDate(discussion.attributes.createdAt),
        category,
        description: `${firstPost.attributes.contentHtml}<hr><h2>最新 ${comments.length} 条评论</h2>${commentHtml}`,
    };
}

export async function getFeed(type: keyof typeof feeds): Promise<Data> {
    const feed = feeds[type];
    const response = await ofetch<ApiResponse<Discussion[]>>(`${baseUrl}/api/discussions`, {
        query: {
            sort: feed.sort,
            ...(type === 'featured' ? { 'filter[frontpage]': true } : {}),
            'page[limit]': 20,
            include: 'firstPost,firstPost.user,user,tags',
        },
    });
    const item = await pMap(response.data, (discussion) => discussionItem(discussion, response.included || []), { concurrency: 3 });

    return {
        title: `生如夏花论坛 - ${feed.title}`,
        link: `${baseUrl}/?sort=${feed.websiteSort}`,
        description: `${feed.title}的正文与最新五条评论`,
        // Preserve the site's featured/hot ranking instead of re-sorting by publication date.
        sortItems: false,
        language: 'zh-CN',
        item,
    };
}
