import { renderToString } from 'hono/jsx/dom/server';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/:id',
    categories: ['social-media'],
    example: '/keep/user/556b02c1ab59390afea671ea',
    parameters: { id: 'Keep 用户 id' },
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
            source: ['show.gotokeep.com/users/:id'],
            target: '/user/:id',
        },
    ],
    name: '运动日记',
    maintainers: ['Dectinc', 'DIYgod'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const id = ctx.req.param('id');

    const response = await ofetch(`https://api.gotokeep.com/social/v3/people/${id}/home`, {
        headers: {
            Referer: `https://show.gotokeep.com/users/${id}`,
        },
    });

    const items = response.data.entries.flatMap((entry) =>
        entry.entries.map((item) => {
            let images: string[] = [];
            if (item.images) {
                images = item.meta.picture ? [item.meta.picture, ...item.images] : item.images;
            } else if (item.meta.picture) {
                images = [item.meta.picture];
            }

            const videoUrl = item.videoBitRateUrls?.[0];
            const poster = videoUrl ? item.images?.[0] : undefined;
            if (poster) {
                images = images.filter((image) => image !== poster);
            }

            const minute = Math.floor(item.meta.secondDuration / 60);
            const second = item.meta.secondDuration - minute * 60;
            return {
                title: item.meta.title,
                pubDate: item.created ? parseDate(item.created) : undefined,
                link: `https://show.gotokeep.com/entries/${item.id}`,
                author: item.author.username,
                description: renderDescription(item, minute, second, images, videoUrl, poster),
                enclosure_url: videoUrl,
                enclosure_type: videoUrl ? 'video/mp4' : undefined,
            };
        })
    );

    return {
        title: `${items[0]?.author ?? id} 的 Keep 动态`,
        link: `https://show.gotokeep.com/users/${id}`,
        language: 'zh-CN',
        item: items,
    };
}

const renderDescription = (item: any, minute: number, second: number, images: string[], videoUrl?: string, poster?: string) =>
    renderToString(<KeepDescription item={item} minute={minute} second={second} images={images} videoUrl={videoUrl} poster={poster} />);

const KeepDescription = ({ item, minute, second, images, videoUrl, poster }: { item: any; minute: number; second: number; images: string[]; videoUrl?: string; poster?: string }) => (
    <>
        项目：
        {item.meta.name === item.meta.workoutName ? item.meta.name : `${item.meta.name} - ${item.meta.workoutName}`}
        <br />
        时长：{minute}分{second}秒
        {item.content ? (
            <>
                <br />
                备注：{item.content}
            </>
        ) : null}
        {videoUrl ? <video controls src={videoUrl} poster={poster} /> : null}
        {images ? (
            <>
                <br />
                {images.map((image) => (
                    <img src={image} />
                ))}
            </>
        ) : null}
    </>
);
