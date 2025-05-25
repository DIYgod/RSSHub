import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/room/:id',
    categories: ['live'],
    example: '/huya/room/11336726',
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
            source: ['huya.com/:id', 'huya.com/'],
        },
    ],
    name: '直播间开播',
    maintainers: ['SettingDust'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    let data;
    let item;
    let room_info;

    try {
        // 尝试通过虎牙API获取直播间信息
        const response = await got({
            method: 'get',
            url: `https://open.huya.com/index.php?m=Stream&do=getStreamInfo&roomId=${id}`,
            headers: {
                Referer: `https://www.huya.com/${id}`,
            },
        });

        if (!response.data.data) {
            throw new Error('Invalid response');
        }

        data = response.data.data;
        room_info = data.info;

        if (data.isOn === 1) {
            item = [
                {
                    title: `开播: ${room_info.introduction}`,
                    pubDate: new Date(room_info.startTime * 1000).toUTCString(),
                    guid: room_info.startTime,
                    link: `https://www.huya.com/${id}`,
                },
            ];
        }
    } catch (e) {
        // 如果API调用失败，尝试通过页面抓取
        const response = await got({
            method: 'get',
            url: `https://www.huya.com/${id}`,
            headers: {
                Referer: `https://www.huya.com/${id}`,
            },
        });

        const html = response.data;
        
        // 从页面中提取直播间信息
        const match = html.match(/"stream":\s*({.*?}),\s*"isOn"/);
        if (match) {
            try {
                const streamInfo = JSON.parse(match[1]);
                room_info = {
                    nick: streamInfo.nick || '',
                    introduction: streamInfo.introduction || '',
                    screenshot: streamInfo.screenshot || '',
                    startTime: streamInfo.startTime || Math.floor(Date.now() / 1000),
                };

                const isLive = html.includes('"isOn":1') || html.includes('"isOn": 1');
                if (isLive) {
                    item = [
                        {
                            title: `开播: ${room_info.introduction}`,
                            pubDate: new Date(room_info.startTime * 1000).toUTCString(),
                            guid: room_info.startTime,
                            link: `https://www.huya.com/${id}`,
                        },
                    ];
                }
            } catch (err) {
                console.error('解析页面数据失败:', err);
            }
        }
    }

    return {
        title: room_info ? `${room_info.nick}的虎牙直播间` : `虎牙直播间 ${id}`,
        image: room_info?.screenshot,
        link: `https://www.huya.com/${id}`,
        item,
        allowEmpty: true,
    };
}
