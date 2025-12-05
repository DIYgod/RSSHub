import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/live/area/:areaID/:order',
    categories: ['live'],
    example: '/bilibili/live/area/207/online',
    parameters: { areaID: '分区 ID 分区增删较多, 可通过 [分区列表](https://api.live.bilibili.com/room/v1/Area/getList) 查询', order: '排序方式, live_time 开播时间, online 人气' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '直播分区',
    maintainers: ['Qixingchen'],
    handler,
    description: `::: warning
  由于接口未提供开播时间，如果直播间未更换标题与分区，将视为一次。如果直播间更换分区与标题，将视为另一项
:::`,
};

async function handler(ctx) {
    const areaID = ctx.req.param('areaID');
    const order = ctx.req.param('order');

    let orderTitle = '';
    switch (order) {
        case 'live_time':
            orderTitle = '最新开播';
            break;
        case 'online':
            orderTitle = '人气直播';
            break;
    }

    const nameResponse = await got({
        method: 'get',
        url: 'https://api.live.bilibili.com/room/v1/Area/getList',
        headers: {
            Referer: 'https://link.bilibili.com/p/center/index',
        },
    });

    let parentTitle = '';
    let parentID = '';
    let areaTitle = '';
    let areaLink = '';

    for (const parentArea of nameResponse.data.data) {
        for (const area of parentArea.list) {
            if (area.id === areaID) {
                parentTitle = parentArea.name;
                parentID = parentArea.id;
                areaTitle = area.name;
                // cateID = area.cate_id;
                areaLink = `https://live.bilibili.com/p/eden/area-tags?parentAreaId=${parentID}&areaId=${areaID}`;
                break;
            }
        }
    }

    const response = await got({
        method: 'get',
        url: `https://api.live.bilibili.com/room/v1/area/getRoomList?area_id=${areaID}&sort_type=${order}&page_size=30&page_no=1`,
        headers: {
            Referer: 'https://live.bilibili.com/p/eden/area-tags',
        },
    });
    const data = response.data.data;

    return {
        title: `哔哩哔哩直播-${parentTitle}·${areaTitle}分区-${orderTitle}`,
        link: areaLink,
        description: `哔哩哔哩直播-${parentTitle}·${areaTitle}分区-${orderTitle}`,
        item: data.map((item) => ({
            title: `${item.uname} ${item.title}`,
            description: `${item.uname} ${item.title}`,
            pubDate: new Date().toUTCString(),
            guid: `https://live.bilibili.com/${item.roomid} ${item.title}`,
            link: `https://live.bilibili.com/${item.roomid}`,
        })),
    };
}
