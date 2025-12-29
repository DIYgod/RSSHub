import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface NoticeItem {
    id: number;
    title: string;
    url?: string;
    time: number;
    code?: string;
    detail?: string;
    textOnlyBody?: string;
}

interface NoticeResponse {
    code: string;
    data: NoticeItem[] | null;
}

const handler: Route['handler'] = async (ctx) => {
    const baseUrl = 'https://www.binance.com';
    const listUrl = `${baseUrl}/bapi/apex/v1/public/apex/market/notice/get`;
    const pageUrl = `${baseUrl}/zh-CN/messages/v2/group/announcement`;
    const language = 'zh-CN';
    const limit = Number.parseInt(ctx.req.query('limit') ?? '20', 10);
    const rows = Number.isNaN(limit) || limit <= 0 ? 20 : limit;
    const headers = {
        Referer: pageUrl,
        'Accept-Language': language,
        'User-Agent': config.trueUA,
        lang: language,
    };

    const noticeResponse = (await ofetch<NoticeResponse>(`${listUrl}?rows=${rows}&page=1`, { headers })) as NoticeResponse;

    const notices = Array.isArray(noticeResponse?.data) ? noticeResponse.data : [];

    const items = notices.map((notice) => {
        const noticeKey = notice.code || String(notice.id);
        const link = notice.url?.startsWith('http') ? notice.url : `${baseUrl}/zh-CN/support/announcement/${noticeKey}`;
        const description = notice.detail || notice.textOnlyBody;

        return {
            title: notice.title,
            link,
            description,
            pubDate: parseDate(notice.time),
        };
    });

    return {
        title: '币安公告',
        link: pageUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/messages/announcement',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/binance/messages/announcement',
    radar: [
        {
            source: ['www.binance.com/zh-CN/messages/v2/group/announcement'],
            target: '/binance/messages/announcement',
        },
    ],
    name: '币安公告',
    description: 'Announcement list from Binance message center.',
    maintainers: ['DIYgod'],
    handler,
};
