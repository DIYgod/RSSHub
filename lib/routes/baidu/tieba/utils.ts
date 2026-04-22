import type {CheerioAPI} from 'cheerio';

import {parseRelativeDate} from '@/utils/parse-date';

/**
 * 解析相对时间（如"回复于4小时前"）为实际日期
 */
export function parseRelativeTime(timeStr: string): Date {
    const normalized = (timeStr || '').replace(/^回复于/, '').trim();
    return parseRelativeDate(normalized, ['M-D', 'YYYY-MM-DD', 'HH:mm', 'YYYY-MM-DD HH:mm', 'YYYY-M-D HH:mm']);
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
    const cardThreads = $('.thread-card-wrapper')
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
                .filter((src): src is string => src !== undefined && src !== '');

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

    if (cardThreads.length > 0) {
        return cardThreads;
    }

    return $('li.j_thread_list')
        .toArray()
        .map((element) => {
            const item = $(element);
            const linkHref = item.find('a.j_th_tit').attr('href') || '';
            const idMatch = linkHref.match(/\/p\/(\d+)/);
            const id = idMatch ? idMatch[1] : '';

            return {
                id,
                title: item.find('a.j_th_tit').text().trim(),
                content: item.find('.threadlist_abs').text().trim(),
                author: item.find('.frs-author-name').first().text().trim(),
                time: item.find('.threadlist_reply_date').first().text().trim(),
                images: item
                    .find('.threadlist_pic img')
                    .toArray()
                    .map((img) => $(img).attr('src') || $(img).attr('bpic') || '')
                    .filter((src) => src !== ''),
                link: linkHref,
            };
        })
        .filter((t) => t.id && t.title);
}
