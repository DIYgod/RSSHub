import { randomUUID } from 'node:crypto';

import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/open/announce',
    categories: ['programming'],
    example: '/ele.me/open/announce',
    name: '商家开放平台公告',
    maintainers: ['phantomk'],
    handler,
};

class NoticeContentError extends Error {}

interface Notice {
    templateId: string | number;
    title: string;
    beginDate?: string;
    content?: string;
}

function getNoticeData<T>(method: string, params: { templateId: string } | { offset: number; limit: number }) {
    return ofetch<{ code: number; result: T }>(`https://app-api.shop.ele.me/arena/invoke/?method=NoticeKeeperService.${method}`, {
        method: 'POST',
        body: {
            id: `${randomUUID().replaceAll('-', '').toUpperCase()}|${Date.now()}`,
            metas: {
                appName: 'Odin',
                appVersion: '4.4.0',
            },
            service: 'NoticeKeeperService',
            method,
            params,
            ncp: '2.0.0',
        },
    });
}

async function getNoticeContent(templateId: string | number) {
    const data = await getNoticeData<Notice>('getBroadcastByTemplateId', { templateId: String(templateId) });
    const content = data.result?.content;
    if (data.code !== 200 || String(data.result?.templateId) !== String(templateId) || typeof content !== 'string' || !content.trim()) {
        throw new NoticeContentError(`Ele.me did not return content for notice ${templateId}.`);
    }
    const $ = load(content);
    if (!$('body').text().trim() && !$('img, video, audio, iframe, object, embed').length) {
        throw new NoticeContentError(`Ele.me returned an empty body for notice ${templateId}.`);
    }
    return content;
}

async function handler() {
    const data = await getNoticeData<{ broadcastList: Notice[] }>('getBroadcastList', { offset: 0, limit: 999 });
    const items = await pMap(
        data.result.broadcastList,
        async (item) => {
            let description = '';
            try {
                description = await cache.tryGet(`ele.me:notice-content:${item.templateId}`, () => getNoticeContent(item.templateId));
            } catch (error) {
                if (!(error instanceof FetchError || error instanceof NoticeContentError)) {
                    throw error;
                }
                logger.warn(`Ele.me did not return usable content for notice ${item.templateId}.`);
            }
            return {
                title: item.title,
                description,
                pubDate: item.beginDate ? timezone(parseDate(item.beginDate), 8) : undefined,
                link: `https://open.shop.ele.me/common/publicnotice/${item.templateId}`,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: '饿了么商家开放平台-公告',
        link: 'https://open.shop.ele.me/common/publicnotice/0',
        item: items,
    };
}
