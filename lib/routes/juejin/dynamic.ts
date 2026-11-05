import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { getShortMsgDescription } from './utils';

export const route: Route = {
    path: '/dynamic/:id',
    categories: ['programming'],
    example: '/juejin/dynamic/3051900006845944',
    parameters: { id: '用户 id, 可在用户页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['juejin.cn/user/:id'],
        },
    ],
    name: '用户动态',
    maintainers: ['CaoMeiYouRen'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const response = await ofetch('https://api.juejin.cn/user_api/v1/user/dynamic', {
        query: {
            user_id: id,
            cursor: 0,
        },
    });
    const list = response.data?.list;
    if (!Array.isArray(list) || !list.length) {
        throw new Error(`No activities were returned for Juejin user ${id}; check the user profile and source API availability.`);
    }

    const user = list[0].user;
    const username = user.user_name;

    const items = list.map((entry) => {
        const { target_type: targetType, target_data: targetData, action, time } = entry; // Actions: 0 publish article, 1 like article, 2 publish pin, 3 like pin, 4 follow user, 5 follow tag.
        let title: string;
        let description: string | undefined;
        let pubDate: Date | undefined;
        let author: string | undefined;
        let link: string | undefined;
        let category: string[] | undefined;
        switch (targetType) {
            case 'short_msg': {
                // Published and liked pins.
                const { msg_Info: msgInfo, author_user_info: authorInfo, msg_id: msgId, topic } = targetData;
                const { content, ctime } = msgInfo;
                title = content;
                description = getShortMsgDescription(msgInfo);
                pubDate = parseDate(Number(ctime) * 1000);
                author = authorInfo.user_name;
                link = `https://juejin.cn/pin/${msgId}`;
                category = topic?.title ? [topic.title] : undefined;
                if (action === 3) {
                    title = `${username} 赞了这篇沸点//@${author}：${title}`;
                }
                break;
            }
            case 'article': {
                // Published and liked articles.
                const { article_id: articleId, article_info: articleInfo, author_user_info: authorInfo, tags } = targetData;
                const { ctime, brief_content: briefContent } = articleInfo;
                title = articleInfo.title;
                description = briefContent;
                pubDate = parseDate(Number(ctime) * 1000);
                author = authorInfo.user_name;
                link = `https://juejin.cn/post/${articleId}`;
                category = [...new Set([targetData.category.category_name, ...tags.map((tag) => tag.tag_name)])];
                if (action === 1) {
                    title = `${username} 赞了这篇文章//@${author}：${title}`;
                }
                break;
            }
            case 'user': {
                // Followed users.
                const { user_name: targetUsername, user_id: userId } = targetData;
                title = `${username} 关注了 ${targetUsername}`;
                description = `${targetUsername}<br>简介：${targetData.description}`;
                author = targetUsername;
                link = `https://juejin.cn/user/${userId}`;
                pubDate = parseDate(time * 1000);
                break;
            }
            case 'tag': {
                // Followed tags.
                const { tag_name: tagName } = targetData;
                title = `${username} 关注了标签 ${tagName}`;
                description = tagName;
                category = [tagName];
                link = `https://juejin.cn/tag/${encodeURIComponent(tagName)}`;
                pubDate = parseDate(time * 1000);
                break;
            }
            default:
                throw new Error(`Unsupported Juejin activity target type: ${targetType}; the source API may have changed.`);
        }
        return {
            title,
            description,
            pubDate,
            author,
            link,
            category,
            guid: `juejin:dynamic:${id}:${action}:${time}:${link}`,
        };
    });
    return {
        title: `掘金用户动态-${username}`,
        link: `https://juejin.cn/user/${id}/`,
        description: user.description || `掘金用户动态-${username}`,
        image: user.avatar_large,
        item: items,
        author: username,
    };
}
