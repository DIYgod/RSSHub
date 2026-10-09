import { load } from 'cheerio';
import { escapeAttribute } from 'entities';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import weiboUtils from './utils';

const parseFreshDate = (value: string, reference?: Date) => {
    let date = value;
    const relative = /^(今天|昨天|前天)\s+(\d{1,2}:\d{2})$/.exec(value);
    const elapsed = /^(\d+)\s*(分钟|小时|秒)前$/.exec(value);
    const monthDay = /^(\d{1,2})月(\d{1,2})日\s+(\d{1,2}:\d{2})$/.exec(value);
    if (relative || elapsed || monthDay || /^\d{1,2}-\d{1,2}\s/.test(value)) {
        if (!reference || Number.isNaN(reference.getTime())) {
            return;
        }
        if (elapsed) {
            const seconds = elapsed[2] === '小时' ? 3600 : elapsed[2] === '分钟' ? 60 : 1;
            return parseDate(reference.getTime() - Number(elapsed[1]) * seconds * 1000);
        }
        const chinaDate = new Date(reference.getTime() + 8 * 60 * 60 * 1000);
        if (relative) {
            const days = relative[1] === '昨天' ? 1 : relative[1] === '前天' ? 2 : 0;
            chinaDate.setUTCDate(chinaDate.getUTCDate() - days);
            date = `${chinaDate.toISOString().slice(0, 10)} ${relative[2]}`;
        } else {
            const parts = monthDay || /^(\d{1,2})-(\d{1,2})\s/.exec(value)!;
            const month = Number(parts[1]);
            const day = Number(parts[2]);
            const isPreviousYear = month > chinaDate.getUTCMonth() + 1 || (month === chinaDate.getUTCMonth() + 1 && day > chinaDate.getUTCDate());
            const year = chinaDate.getUTCFullYear() - Number(isPreviousYear);
            date = `${year}-${monthDay ? `${monthDay[1]}-${monthDay[2]} ${monthDay[3]}` : value}`;
        }
    }
    const parsed = timezone(parseDate(date, 'YYYY-M-D HH:mm'), 8);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const route: Route = {
    path: '/fresh/:id',
    name: '新鲜事',
    example: '/weibo/fresh/7574046780235777_1',
    categories: ['social-media'],
    maintainers: ['DIYgod'],
    parameters: { id: '新鲜事页面 URL 中的标识，例如 7574046780235777_1 或 60e8c3bf5b9c0e70_0。保留末尾的栏目类型。' },
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
        requireConfig: [{ name: 'WEIBO_COOKIES', optional: true, description: '仅登录可见的新鲜事需要配置。' }],
    },
    radar: [{ source: ['weibo.com/a/hot/:id.html'], target: '/fresh/:id' }],
    description: '订阅源页面首屏的精选内容或全部微博。保留新鲜事本身的栏目与顺序；正文为源页面提供的摘要及配图。',
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    if (!/^[a-z0-9]+_[01]$/i.test(id)) {
        throw new InvalidParameterError('Use the complete fresh-topic ID from /a/hot/:id.html, including its _0 or _1 suffix.');
    }
    const link = `https://weibo.com/a/hot/${id}.html`;
    const response = await weiboUtils.tryWithCookies(async (cookies, verifier) => {
        const response = await ofetch.raw(link, { headers: { Cookie: cookies, Referer: 'https://weibo.com/a/hot/realtime' }, responseType: 'text' });
        verifier({ data: response._data });
        return response;
    });
    const $ = load(response._data!);
    const serverDate = response.headers.get('date');
    const reference = serverDate ? parseDate(serverDate) : undefined;
    const title = $('h2.list_title').first().text();
    if (!title) {
        throw new Error('The Weibo fresh-topic page is unavailable. Verify the topic ID and WEIBO_COOKIES if login is required.');
    }

    const items = $('[action-type="feed_list_item"][mid][href]')
        .toArray()
        .map((element) => {
            const $item = $(element);
            const content = $item.find('h3.list_title_s, .list_des').first();
            content.find('a').remove();
            const images = $item
                .find('.pic > img')
                .toArray()
                .map((image) => `<img src="${escapeAttribute(new URL($(image).attr('src')!, link).href)}">`)
                .join('');
            const date = $item.find('.subinfo_box > span.subinfo:not(.subinfo_rgt)').first().text();
            return {
                title: content.text(),
                description: `${content.html() || ''}${images}`,
                link: new URL($item.attr('href')!, link).href,
                author: $item.find('.subinfo_box a .subinfo').text(),
                pubDate: date ? parseFreshDate(date, reference) : undefined,
            };
        });

    return { title: `${title} - 微博新鲜事`, link, item: items };
}
