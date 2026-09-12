import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/tag/:id?',
    categories: ['study'],
    example: '/marginnote/tag/经验分享',
    parameters: { id: '标签名，见下表，默认为 经验分享' },
    name: '标签',
    maintainers: ['nczitzk'],
    description: `| 经验分享 | 论坛精华 | 待跟进反馈 | 优秀建议 | 精选回答 | 官方签名 | 自动更新 | 3674 以上版本支持 | 368 以上版本支持 | 未经验证的安全风险 | 笔记本分享 | 关键反馈 | 精选话题讨论 | 灵感盒 | 引用 |
| -------- | -------- | ---------- | -------- | -------- | -------- | -------- | ----------------- | ---------------- | ------------------ | ---------- | -------- | ------------ | ------ | ---- |`,
    handler,
};

async function handler(ctx: Context) {
    const { id = '经验分享' } = ctx.req.param();

    const rootUrl = 'https://bbs.marginnote.com.cn';
    const currentUrl = `${rootUrl}/tag/${id}/l/latest.json`;
    const response = await ofetch(currentUrl);

    const list = response.topic_list.topics.slice(0, 10).map((item) => ({
        id: item.id,
        title: item.title,
        link: `${rootUrl}/t/topic/${item.id}`,
        pubDate: parseDate(item.last_posted_at),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(`${rootUrl}/t/${item.id}.json`);
                const post = detailResponse.post_stream.posts[0];

                item.author = post.display_username || post.username;
                item.description = post.cooked;

                return item;
            })
        )
    );

    return {
        title: `${response.topic_list.tags[0].name} - MarginNote 中文论坛`,
        link: currentUrl,
        item: items,
    };
}
