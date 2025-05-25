import { Route } from '@/types';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';
import got from '@/utils/got';

export const route: Route = {
    path: '/live/:id',
    categories: ['live'],
    example: '/huya/live/10188',
    parameters: { id: '直播间ID，可在直播间URL中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['huya.com/:id'],
            target: '/live/:id',
        },
    ],
    name: '直播间',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    let room_info = null;

    try {
        const response = await got(`https://www.huya.com/${id}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
        });

        const html = response.body;
        logger.debug(`页面抓取成功，内容长度: ${html.length}`);
        
        // 提取页面标题
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        let pageTitle = titleMatch ? titleMatch[1] : `虎牙直播间 ${id}`;
        
        // 提取主播昵称
        let nick = '';
        const nickMatch = pageTitle.match(/^(.*?)直播_/);
        if (nickMatch) {
            nick = nickMatch[1];
        }
                        
        // 提取TT_ROOM_DATA结构化数据
        const ttRoomDataMatch = html.match(/var TT_ROOM_DATA = (\{.*?\});/s);
        const isLive = ttRoomDataMatch ? JSON.parse(ttRoomDataMatch[1]).isOn : false;
        
        // 提取TT_ROOM_DATA中的直播间标题
        const ttRoomData = ttRoomDataMatch ? JSON.parse(ttRoomDataMatch[1]) : {};
        const introduction = ttRoomData.introduction || '';
        
        // 提取直播间截图
        const screenshotMatch = html.match(/screenshot\s*:\s*'([^']*?)'/);
        const screenshot = screenshotMatch ? screenshotMatch[1] : '';
        
        // 提取开播时间
        const startTimeMatch = html.match(/startTime\s*:\s*'?(\d+)'?/);
        const startTime = startTimeMatch ? parseInt(startTimeMatch[1]) : Math.floor(Date.now() / 1000);
        
        // 构建房间信息
        room_info = {
            nick: nick || `虎牙用户${id}`,
            introduction: introduction || pageTitle,
            screenshot: screenshot,
            startTime: startTime
        };
        
        let item = [];
        if (isLive) {
            item = [
                {
                    title: room_info.introduction,
                    pubDate: parseDate(room_info.startTime * 1000),
                    guid: room_info.startTime,
                    link: `https://www.huya.com/${id}`,
                },
            ];
        }

        return {
            title: room_info ? `${room_info.nick}的虎牙直播间` : `虎牙直播间 ${id}`,
            image: room_info?.screenshot,
            link: `https://www.huya.com/${id}`,
            item,
            allowEmpty: true,
        };
    } catch (e) {
        logger.error('页面抓取失败:', e.message);
        return {
            title: `虎牙直播间 ${id}`,
            link: `https://www.huya.com/${id}`,
            item: [],
            allowEmpty: true,
        };
    }
} 