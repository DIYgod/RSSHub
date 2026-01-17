import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

type CheerioInstance = ReturnType<typeof load>;
type CheerioSelection = ReturnType<CheerioInstance>;

interface DateContext {
    currentYear: number;
    prevMonth: number;
    prevDay: number;
}

function parseDateString(dateStr: string, ctx: DateContext): Date | undefined {
    // 格式如 "1月9·周五" 或 "12月25·周三"
    const match = dateStr.match(/(\d+)月(\d+)/);
    if (!match) {
        return undefined;
    }

    const month = Number.parseInt(match[1], 10);
    const day = Number.parseInt(match[2], 10);

    // 检测跨年：如果当前日期比上一个日期大，说明跨年了
    if (ctx.prevMonth > 0 && (month > ctx.prevMonth || (month === ctx.prevMonth && day > ctx.prevDay))) {
        ctx.currentYear--;
    }

    ctx.prevMonth = month;
    ctx.prevDay = day;

    // 网站只提供日期，不提供时间，使用 timezone 处理时区
    return timezone(parseDate(`${ctx.currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`), 8);
}

function processNewsList($: CheerioInstance, $newsList: CheerioSelection, ctx: DateContext): DataItem[] {
    let currentPubDate: Date | undefined;

    return $newsList
        .children()
        .toArray()
        .flatMap((child) => {
            const $child = $(child);

            if ($child.hasClass('news-date')) {
                currentPubDate = parseDateString($child.text().trim(), ctx);
                return [];
            }

            if ($child.hasClass('news-item') && currentPubDate) {
                const $link = $child.find('h2 a');
                const title = $link.text().trim();
                const link = $link.attr('href');
                const description = $child.find('p.text-muted').html() || '';

                if (!link) {
                    return [];
                }

                return {
                    title,
                    link,
                    guid: link,
                    description,
                    pubDate: currentPubDate,
                    author: 'AI工具集',
                };
            }

            if ($child.hasClass('news-list')) {
                return processNewsList($, $child, ctx);
            }

            return [];
        });
}

async function handler(): Promise<Data> {
    const response = await ofetch('https://ai-bot.cn/daily-ai-news/');
    const $ = load(response);
    const $firstNewsList = $('.news-list').first();

    const dateCtx: DateContext = {
        currentYear: new Date().getFullYear(),
        prevMonth: 0,
        prevDay: 0,
    };

    const items = processNewsList($, $firstNewsList, dateCtx);

    return {
        title: '每日AI资讯 | AI工具集',
        link: 'https://ai-bot.cn/daily-ai-news/',
        item: items,
    };
}

export const route: Route = {
    path: '/daily-ai-news',
    categories: ['new-media'],
    example: '/ai-bot/daily-ai-news',
    parameters: {},
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
            source: ['ai-bot.cn/daily-ai-news', 'ai-bot.cn/daily-ai-news/'],
            target: '/daily-ai-news',
        },
    ],
    name: '每日AI资讯',
    maintainers: ['redwood9'],
    handler,
    url: 'ai-bot.cn/daily-ai-news',
    description: '获取 AI 工具集网站的每日 AI 资讯汇总。',
};
