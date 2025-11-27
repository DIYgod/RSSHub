import path from 'node:path';

import type { Route } from '@/types';
import got from '@/utils/got';
import { art } from '@/utils/render';

const renderDescription = (info) => art(path.join(__dirname, '../templates/music/userevents.art'), info);

export const route: Route = {
    path: '/music/user/events/:id',
    categories: ['multimedia'],
    name: '用户动态',
    maintainers: ['Master-Hash'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const response = await got(`https://music.163.com/api/event/get/${id}`, {
        headers: {
            Referer: 'https://music.163.com/',
        },
    });

    const { data } = response;
    const { nickname, signature, avatarUrl } = data.events[0].user;

    return {
        title: `${nickname}的云村动态`,
        link: `https://music.163.com/#/user/event?id=${id}`,
        description: `网易云音乐用户动态 - ${signature}`,
        icon: avatarUrl,
        image: avatarUrl,
        item: data.events.map((item) => {
            const title = item.info.commentThread.resourceTitle;
            const userId = item.user.userId;
            const description = JSON.parse(item.json).msg;
            const pics = item.pics.map(({ originUrl }) => originUrl);
            const eventId = item.id;

            /**
             * @todo 根据 `item.info.commentThread.resourceInfo.eventType` 生成 Media
             * 17 分享节目
             * 18 分享单曲
             * 19 分享专辑
             * 35 空
             * 因为我不需要，我就不写了。
             * 因为 api 并没有 mp3 URL，生成 `media` 字段会有困难。
             */
            return {
                title,
                description: renderDescription({ description, pics }),
                link: `https://music.163.com/#/event?id=${eventId}&uid=${userId}`,
                pubDate: new Date(item.eventTime),
                published: new Date(item.eventTime),
                author: nickname,
                upvotes: item.info.likedCount,
                comments: item.info.commentCount,
            };
        }),
    };
}
