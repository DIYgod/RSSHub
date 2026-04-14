import type { CheerioAPI } from 'cheerio';

import { parseDate } from '@/utils/parse-date';

/**
 * 解析相对时间（如"回复于4小时前"）为实际日期
 */
export function parseRelativeTime(timeStr: string): Date {
    const now = new Date();

    // 如果时间为空，返回当前时间
    if (!timeStr || timeStr.trim() === '') {
        return now;
    }

    // 移除"回复于"前缀
    const cleanStr = timeStr.replace(/^回复于/, '').trim();

    // 匹配 "刚刚"
    if (cleanStr === '刚刚' || cleanStr.includes('刚刚')) {
        return now;
    }

    // 匹配 "X小时前"
    const hourMatch = cleanStr.match(/(\d+)\s*小时前/);
    if (hourMatch) {
        const hours = Number.parseInt(hourMatch[1], 10);
        return new Date(now.getTime() - hours * 60 * 60 * 1000);
    }

    // 匹配 "X分钟前"
    const minMatch = cleanStr.match(/(\d+)\s*分钟前/);
    if (minMatch) {
        const mins = Number.parseInt(minMatch[1], 10);
        return new Date(now.getTime() - mins * 60 * 1000);
    }

    // 匹配 "X天前"
    const dayMatch = cleanStr.match(/(\d+)\s*天前/);
    if (dayMatch) {
        const days = Number.parseInt(dayMatch[1], 10);
        return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    // 匹配 "昨天 HH:mm"
    const yesterdayMatch = cleanStr.match(/昨天\s*(\d{1,2}):(\d{2})/);
    if (yesterdayMatch) {
        const date = new Date(now);
        date.setDate(date.getDate() - 1);
        date.setHours(Number.parseInt(yesterdayMatch[1], 10), Number.parseInt(yesterdayMatch[2], 10), 0, 0);
        return date;
    }

    // 匹配 "今天 HH:mm"
    const todayMatch = cleanStr.match(/今天\s*(\d{1,2}):(\d{2})/);
    if (todayMatch) {
        const date = new Date(now);
        date.setHours(Number.parseInt(todayMatch[1], 10), Number.parseInt(todayMatch[2], 10), 0, 0);
        return date;
    }

    // 尝试标准日期格式
    try {
        // @ts-ignore
        const parsed = parseDate(cleanStr, ['M-D', 'YYYY-MM-DD', 'HH:mm', 'YYYY-MM-DD HH:mm', 'YYYY-M-D HH:mm'], true);
        // 检查是否是有效日期
        if (parsed && !Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    } catch {
        // 解析失败，返回当前时间
    }

    // 默认返回当前时间
    return now;
}

/**
 * 帖子数据接口
 */
export interface Thread {
    id: string;
    title: string;
    content: string;
    author: string;
    time: string;
    images: string[];
    link: string;
}

/**
 * 解析帖子列表
 */
export function parseThreads($: CheerioAPI): Thread[] {
    return $('.thread-card-wrapper')
        .toArray()
        .map((element) => {
            const item = $(element);

            const linkHref = item.find('a.thread-content-link').attr('href') || '';
            const idMatch = linkHref.match(/\/p\/(\d+)/);
            const id = idMatch ? idMatch[1] : '';

            const title = item.find('.thread-title .text').text().trim();
            const content = item.find('.thread-content .text').text().trim();
            const author = item.find('.head-name').text().trim();

            const descInfo = item.find('.desc-info');
            const timeText = descInfo.length > 0 ? descInfo.text().trim() : item.find('.time, .date').text().trim();

            const images = item
                .find('.image-list-item img')
                .toArray()
                .map((img) => $(img).attr('data-src'))
                .filter((src): src is string => !!src);

            return {
                id,
                title,
                content,
                author,
                time: timeText,
                images,
                link: linkHref,
            };
        })
        .filter((t) => t.id && t.title);
}
