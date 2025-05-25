// 修改router.ts文件，使用art模板渲染描述
import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

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
    let roomInfo = null;
    let item = null;

    try {
        // 尝试通过页面抓取获取直播间信息
        const response = await got(`https://www.huya.com/${id}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                Referer: 'https://www.huya.com',
            },
        });

        const html = response.body;
        
        // 提取页面标题
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        const pageTitle = titleMatch ? titleMatch[1] : `虎牙直播间 ${id}`;
        
        // 提取主播昵称
        let nick = '';
        const nickMatch = pageTitle.match(/^(.*?)直播_/);
        if (nickMatch) {
            nick = nickMatch[1];
        }
        
        // 检查是否在线
        const isLiveMatch = html.match(/ISLIVE\s*=\s*'(\d+)'/);
        const isLive = isLiveMatch && isLiveMatch[1] === '1';
        
        // 提取直播间标题
        const introMatch = html.match(/introduction\s*:\s*'([^']*?)'/);
        const introduction = introMatch ? introMatch[1] : '';
        
        // 提取直播间截图
        const screenshotMatch = html.match(/screenshot\s*:\s*'([^']*?)'/);
        const screenshot = screenshotMatch ? screenshotMatch[1] : '';
        
        // 提取开播时间
        const startTimeMatch = html.match(/startTime\s*:\s*'?(\d+)'?/);
        const startTime = startTimeMatch ? parseInt(startTimeMatch[1]) : Math.floor(Date.now() / 1000);
        
        // 构建房间信息
        roomInfo = {
            nick: nick || `虎牙用户${id}`,
            introduction: introduction || pageTitle,
            screenshot: screenshot,
            startTime: startTime
        };
        
        if (isLive) {
            item = [
                {
                    title: `开播: ${roomInfo.introduction}`,
                    pubDate: parseDate(roomInfo.startTime * 1000),
                    guid: roomInfo.startTime.toString(),
                    link: `https://www.huya.com/${id}`,
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        screenshot: roomInfo.screenshot,
                        nick: roomInfo.nick,
                        introduction: roomInfo.introduction,
                        startTime: new Date(roomInfo.startTime * 1000).toLocaleString(),
                    }),
                    author: roomInfo.nick,
                },
            ];
        }
    } catch (e) {
        throw new Error('获取直播间信息失败');
    }

    return {
        title: roomInfo ? `${roomInfo.nick}的虎牙直播间` : `虎牙直播间 ${id}`,
        image: roomInfo?.screenshot,
        link: `https://www.huya.com/${id}`,
        item,
        allowEmpty: true,
    };
}
