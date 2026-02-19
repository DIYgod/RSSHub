import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import type { UserInfo, VideoItem } from './types';
import { getUserInfoById, getUserVideosById, renderVideo } from './utils';

const handler = async (ctx: Context) => {
    const { id } = ctx.req.param();
    const embed = !ctx.req.param('embed');

    const userInfo: UserInfo = await getUserInfoById(id);
    const videos: VideoItem[] = await getUserVideosById(id);

    const items = videos.map(({ essential: video }) => ({
        title: video.title,
        link: `https://www.nicovideo.jp/watch/${video.id}`,
        pubDate: parseDate(video.registeredAt),
        author: [{ name: video.owner.name, avatar: video.owner.iconUrl, url: `https://www.nicovideo.jp/user/${video.owner.id}` }],
        description: renderVideo(video, embed),
        image: video.thumbnail.nHdUrl || video.thumbnail.largeUrl || video.thumbnail.middleUrl,
        upvotes: video.count.like,
        comments: video.count.comment,
    })) as DataItem[];

    return {
        title: `${userInfo.nickname} - ニコニコ`,
        link: `https://www.nicovideo.jp/user/${id}/video`,
        image: userInfo.icon,
        item: items,
    };
};

export const route: Route = {
    name: 'User Videos',
    path: '/user/:id/video/:embed?',
    parameters: { id: 'User ID', embed: 'Default to embed the video, set to any value to disable embedding' },
    example: '/nicovideo/user/16690815/video',
    maintainers: ['TonyRL'],
    radar: [
        {
            source: ['www.nicovideo.jp/user/:id', 'www.nicovideo.jp/user/:id/video'],
            target: '/user/:id/video',
        },
    ],
    handler,
};
