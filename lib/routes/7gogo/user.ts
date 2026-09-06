import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/:username',
    categories: ['social-media'],
    example: '/7gogo/user/akimoto-manatsu',
    parameters: { username: '用户名, 可在 URL 中找到' },
    name: '用户时间线',
    maintainers: ['hoilc'],
    radar: [
        {
            source: ['7gogo.jp/:username'],
        },
    ],
    handler,
};

const postTypes = {
    1: '文字',
    2: '表情',
    3: '纯图片',
    4: '评论',
    5: '转发',
    6: '纯视频',
    7: '图片文字',
    8: '视频文字',
};

const getContent = (post) =>
    post.body &&
    post.body
        .map((item) => {
            switch (item.bodyType) {
                case 1:
                    return `<p>${item.text.replaceAll('\n', '<br/>')}</p>`;
                case 2:
                case 3:
                    return `<img src="${item.image}">`;
                case 4:
                    return `<blockquote>${item.comment.user.name}:<br/>${item.comment.comment.body.replaceAll('\n', '<br/>')}</blockquote>`;
                case 7:
                    return `<blockquote>${item.talk.name}:<br/>${getContent(item.post)}</blockquote>`;
                case 8:
                    return `<video src="${item.movieUrlHq}" poster="${item.thumbnailUrl}" controls loop>Video</video>`;
                default:
                    return '';
            }
        })
        .join('');

const getTitle = (post) => {
    const texts = post.body.filter((s) => s.bodyType === 1);
    const typeName = postTypes[post.postType];
    return texts.length === 0 ? typeName : texts[0].text.split('\n', 1)[0];
};

async function handler(ctx: Context) {
    const { username } = ctx.req.param();

    const url = `https://api.7gogo.jp/web/v2/talks/${username}/posts?talkId=${username}&direction=PREV`;

    const response = await ofetch(url);
    const list = response.data;

    const userDisplayName = list[0].user.name;
    const userDescription = list[0].user.description;
    const userImage = list[0].user.coverImageUrl;

    return {
        title: `${userDisplayName} - 755`,
        image: userImage,
        description: userDescription,
        link: `https://7gogo.jp/${username}`,
        item: list.map((item) => ({
            title: getTitle(item.post),
            author: userDisplayName,
            description: getContent(item.post),
            pubDate: parseDate(item.post.time * 1000),
            link: `https://7gogo.jp/${username}/${item.post.postId}`,
        })),
    };
}
