import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/room/:id',
    categories: ['live'],
    example: '/douyu/room/24422',
    parameters: { id: '直播间 id, 可在主播直播间页 URL 中找到' },
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
            source: ['www.douyu.com/:id', 'www.douyu.com/'],
        },
    ],
    name: '直播间开播',
    maintainers: ['DIYgod', 'ChaosTong'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    let data;
    let item;
    let room_thumb;
    try {
        const response = await got({
            method: 'get',
            url: `https://www.douyu.com/betard/${id}`,
        });

        if (!response.data.room) {
            throw new Error('Invalid response');
        }

        data = response.data.room;
        room_thumb = data.room_pic;

        if (data.show_status === 1) {
            item =
                data.videoLoop === 1
                    ? [
                          {
                              title: `视频轮播: ${data.room_name}`,
                              pubDate: new Date(data.show_time * 1000).toUTCString(),
                              guid: data.show_time,
                              link: `https://www.douyu.com/${id}`,
                          },
                      ]
                    : [
                          {
                              title: `开播: ${data.room_name}`,
                              pubDate: new Date(data.show_time * 1000).toUTCString(),
                              guid: data.show_time,
                              link: `https://www.douyu.com/${id}`,
                          },
                      ];
        }
        // make a fallback to the old api
    } catch {
        const response = await got({
            method: 'get',
            url: `http://open.douyucdn.cn/api/RoomApi/room/${id}`,
            headers: {
                Referer: `https://www.douyu.com/${id}`,
            },
        });

        data = response.data.data;
        room_thumb = data.room_thumb;

        if (data.online !== 0) {
            item = [
                {
                    title: `开播: ${data.room_name}`,
                    pubDate: new Date(data.start_time).toUTCString(),
                    guid: data.start_time,
                    link: `https://www.douyu.com/${id}`,
                },
            ];
        }
    }

    return {
        title: `${data.owner_name}的斗鱼直播间`,
        image: room_thumb,
        link: `https://www.douyu.com/${id}`,
        item,
        allowEmpty: true,
    };
}
