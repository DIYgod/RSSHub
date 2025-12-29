import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import RejectError from '@/errors/types/reject';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { generateHeaders, PRESETS } from '@/utils/header-generator';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { generate_a_bogus } from './a-bogus';
import type { Feed } from './types';

const renderVideo = (url, poster) =>
    renderToString(
        <video controls preload="metadata" poster={poster}>
            <source src={url} type="video/mp4" />
        </video>
    );

export const route: Route = {
    path: '/user/token/:token',
    categories: ['new-media'],
    example: '/toutiao/user/token/MS4wLjABAAAAEmbqJP2CmC8XXv1BpMvQ3sQHKAxFsq8wHxj8XVIQWja6tMcB-QEbFkzkRNgMl12M',
    parameters: { token: '用户 token，可在用户主页 URL 找到' },
    features: {
        antiCrawler: true,
    },
    radar: [
        {
            source: ['www.toutiao.com/c/user/token/:token'],
        },
    ],
    name: '头条主页',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { token } = ctx.req.param();

    const feed = (await cache.tryGet(
        `toutiao:user:${token}`,
        async () => {
            const query = `category=profile_all&token=${token}&max_behot_time=0&entrance_gid&aid=24&app_name=toutiao_web`;

            const headers = generateHeaders(PRESETS.MODERN_WINDOWS_CHROME);
            const userAgent = headers['user-agent'];

            const data = await ofetch(`https://www.toutiao.com/api/pc/list/feed?${query}&a_bogus=${generate_a_bogus(query, userAgent)}`, {
                headerGeneratorOptions: PRESETS.MODERN_WINDOWS_CHROME,
            });

            return data.data;
        },
        config.cache.routeExpire,
        false
    )) as Feed[];

    if (!feed) {
        throw new RejectError('无法获取用户信息');
    }

    const items = feed.map((item) => {
        switch (item.cell_type) {
            case 0:
            case 49: {
                const video = item.video.play_addr_list.toSorted((a, b) => b.bitrate - a.bitrate)[0];
                return {
                    title: item.title,
                    description: renderVideo(item.video.play_addr_list.toSorted((a, b) => b.bitrate - a.bitrate)[0].play_url_list[0], item.video.origin_cover.url_list[0]),
                    link: `https://www.toutiao.com/video/${item.id}/`,
                    pubDate: parseDate(item.publish_time, 'X'),
                    author: item.user?.info.name ?? item.source,
                    enclosure_url: video?.play_url_list[0],
                    enclosure_type: video?.play_url_list[0] ? 'video/mp4' : undefined,
                    user: {
                        name: item.user?.info.name,
                        avatar: item.user?.info.avatar_url,
                        description: item.user?.info.desc,
                    },
                };
            }

            // text w/o title
            case 32: {
                const enclosure = item.large_image_list?.pop();
                return {
                    title: item.content?.split('\n')[0],
                    description: item.rich_content,
                    link: `https://www.toutiao.com/w/${item.id}/`,
                    pubDate: parseDate(item.publish_time, 'X'),
                    author: item.user?.name,
                    enclosure_url: enclosure?.url,
                    enclosure_type: enclosure?.url ? `image/${new URL(enclosure.url).pathname.split('.').pop()}` : undefined,
                    user: {
                        name: item.user?.name,
                        avatar: item.user?.avatar_url,
                        description: item.user?.desc,
                    },
                };
            }

            // text w/ title
            case 60:
            default:
                return {
                    title: item.title,
                    description: item.abstract,
                    link: `https://www.toutiao.com/article/${item.id}/`,
                    pubDate: parseDate(item.publish_time, 'X'),
                    author: item.user_info?.name,
                    user: {
                        name: item.user_info?.name,
                        avatar: item.user_info?.avatar_url,
                        description: item.user_info?.description,
                    },
                };
        }
    });

    return {
        title: `${items[0].user.name}的头条主页 - 今日头条(www.toutiao.com)`,
        description: items[0].user.description,
        link: `https://www.toutiao.com/c/user/token/${token}/`,
        image: items[0].user.avatar,
        item: items,
    };
}
