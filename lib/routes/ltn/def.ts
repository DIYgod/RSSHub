import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const channels = {
    breakingnewslist: '軍情動態',
    'list/10': '國際軍情',
    'list/11': '台海軍情',
    'list/22': '軍情看板',
    mitlist: '國防MIT',
    'list/12': '國機國造',
    'list/13': '國艦國造',
    'list/14': '潛艦國造',
    'list/23': '飛彈',
    'list/24': '戰甲車國造',
    'list/15': '國防產業',
    'list/25': '其他裝備',
    pedialist: '軍武百科',
    'list/16': '圖解軍武',
    'list/17': '陸用裝備',
    'list/18': '海軍系統',
    'list/19': '空軍系統',
    historylist: '國防祕辛',
    stylelist: '軍風尚',
    'list/27': '將軍官邸故事',
    'list/28': '軍事風餐廳',
    'list/29': '軍風文創',
    'list/30': '軍風世界',
    filelist: '軍武書摘',
    forumlist: '自由講武堂',
    'list/20': '投書',
    'list/21': '論壇',
    peoplelist: '軍情人物',
};

export const route: Route = {
    path: '/def/:channel{.+}?',
    categories: ['traditional-media'],
    example: '/ltn/def/breakingnewslist',
    parameters: {
        channel: {
            description: 'Channel, see the table below',
            options: Object.entries(channels).map(([value, label]) => ({ value, label })),
            default: 'breakingnewslist',
        },
    },
    radar: [
        {
            source: ['def.ltn.com.tw/:channel'],
            target: '/def/:channel',
        },
        {
            source: ['def.ltn.com.tw/list/:id'],
            target: '/def/list/:id',
        },
    ],
    name: '自由軍武頻道',
    maintainers: ['TonyRL'],
    handler,
    url: 'def.ltn.com.tw',
};

async function handler(ctx: Context) {
    const { channel = 'breakingnewslist' } = ctx.req.param();
    const baseUrl = 'https://def.ltn.com.tw';

    const response = await ofetch(`${baseUrl}/ajax/${channel}/1`, { responseType: 'json' });

    const list: DataItem[] = response.map((item) => ({
        title: item.title,
        link: item.url,
        pubDate: timezone(parseDate(item.createTime, 'YYYYMMDDHHmmss'), 8),
        image: item.url_b,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const content = $('.whitecon:not(.template) div[data-desc="內文"]');
                content.find('.before_ir, .after_ir, [id^="ad"], .appE1121').remove();
                content.find('img[data-src]').each((_, img) => {
                    $(img).attr('src', $(img).attr('data-src')!).removeAttr('data-src');
                });
                content.find('iframe[src^="https://www.youtube.com/embed/"]').each((_, iframe) => {
                    $(iframe).attr('referrerpolicy', 'strict-origin-when-cross-origin').removeAttr('allow');
                });

                item.description = content.html()?.trim();
                return item;
            })
        )
    );

    return {
        title: `${channels[channel] ?? ''} - 自由軍武頻道`,
        link: `${baseUrl}/${channel}`,
        language: 'zh-TW' as const,
        image: `${baseUrl}/assets/images/1200_def.png`,
        item: items,
    };
}
