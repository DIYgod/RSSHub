import { load } from 'cheerio';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/group/topic/:id/:author?',
    name: '小组帖子更新',
    example: '/douban/group/topic/309838592',
    categories: ['social-media'],
    maintainers: ['DIYgod'],
    parameters: {
        id: '小组帖子 URL 中的数字 ID。',
        author: {
            description: '回帖范围。',
            default: 'all',
            options: [
                { value: 'all', label: '全部' },
                { value: 'author', label: '只看楼主' },
            ],
        },
    },
    features: { antiCrawler: true, requireConfig: [{ name: 'DOUBAN_COOKIE', optional: true, description: '需要登录才能查看的帖子请配置本人豆瓣 Cookie。' }] },
    radar: [{ source: ['www.douban.com/group/topic/:id'], target: '/group/topic/:id' }],
    description:
        '订阅主帖正文和源页面首屏回帖。主帖标题或正文改变时产生新 GUID，以供阅读器识别更新。只看楼主使用源站的 author=1 页面。源站回帖按从早到晚排序，因此长帖尾页的新回复尚不在本路由范围内。日期保留源站创建时间，不冒充最后更新时间。',
    handler,
};

export function parseGroupTopic(html: string, link: string): { title: string; item: DataItem[] } {
    const $ = load(html);
    const title = $('h1').text();
    const content = $('.topic-content .rich-content').html();
    if (!title || !content) {
        throw new Error('The Douban group topic is unavailable. Verify the topic ID, account access and DOUBAN_COOKIE.');
    }
    const created = $('.topic-meta .create-time').text();
    const ipLocation = $('.topic-meta .ip-location').text();
    const post: DataItem = {
        title,
        link,
        description: content,
        author: $('.topic-doc h3 .from a').text(),
        pubDate: created ? timezone(parseDate(created, 'YYYY-MM-DD HH:mm:ss'), 8) : undefined,
        category: ipLocation ? [`IP属地：${ipLocation}`] : undefined,
        guid: `${link}#content-${md5(`${title}\n${content}`)}`,
    };
    const replies = $('#comments > .comment-item[id]')
        .toArray()
        .map((element): DataItem => {
            const $reply = $(element);
            const pubtime = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})(?:\s+(\S.*))?$/.exec($reply.find('.pubtime').first().text());
            return {
                title: $reply.find('.reply-content').text(),
                description: $reply.find('.reply-content').html(),
                link: `${link}#${$reply.attr('id')}`,
                author: $reply.find('h4 > a').first().text(),
                pubDate: pubtime ? timezone(parseDate(pubtime[1], 'YYYY-MM-DD HH:mm:ss'), 8) : undefined,
                category: pubtime?.[2] ? [`IP属地：${pubtime[2]}`] : undefined,
            };
        });
    return { title, item: [post, ...replies] };
}

async function handler(ctx) {
    const id = ctx.req.param('id');
    const author = ctx.req.param('author') || 'all';
    if (!/^\d+$/.test(id) || !['all', 'author'].includes(author)) {
        throw new InvalidParameterError('Use a numeric topic ID and all or author for the reply scope.');
    }
    const link = `https://www.douban.com/group/topic/${id}/`;
    const { data } = await got(link, { headers: { Cookie: config.douban.cookie }, searchParams: author === 'author' ? { author: 1 } : undefined });
    const result = parseGroupTopic(data, link);
    return { title: `${result.title} - 豆瓣小组帖子`, link, item: result.item };
}
