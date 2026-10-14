import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/subject/:subject_id',
    categories: ['finance'],
    example: '/xuangubao/subject/41',
    parameters: { subject_id: '主题 id，网址 https://xuangubao.cn/subject/41 中最后的数字' },
    name: '主题',
    maintainers: ['hillerliao'],
    handler,
};

type SubjectMessage = {
    Id: string | number;
    Title: string;
    Url?: string;
    ShareUrl2?: string;
    CreatedAt?: string | number;
    Summary?: string;
    PcImage?: string;
};

function parseMessageDate(value?: string | number | null) {
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
        return;
    }
    const timestamp = Number(value);
    if (!Number.isFinite(timestamp)) {
        return;
    }
    const date = parseDate(timestamp, 'X');
    return Number.isNaN(date.getTime()) ? undefined : date;
}

async function fetchMessageContent(detailUrl: string, referer: string): Promise<Pick<DataItem, 'description'>> {
    const detail = await ofetch(detailUrl, { headers: { Referer: referer } });
    return { description: detail.Content };
}

async function handler(ctx: Context) {
    const { subject_id: subjectId } = ctx.req.param();

    const link = `https://xuangubao.cn/subject/${subjectId}`;
    const response = await ofetch(`https://api.xuangubao.cn/api/pc/subj/${subjectId}?limit=20`, {
        headers: {
            Referer: link,
        },
    });

    const subject = response.Subject;
    const messages: SubjectMessage[] = response.Messages;

    const out = await pMap(
        messages,
        async (item) => {
            const detailUrl = `https://baoer-api-prod.xuangubao.cn/baoer_backend/api/messages/show/v2/${item.Id}?subjectId=${subjectId}`;
            const detail = await cache.tryGet(detailUrl, () => fetchMessageContent(detailUrl, `https://m.xuangubao.cn/subject/${subjectId}`));
            return {
                title: item.Title,
                link: item.Url || item.ShareUrl2,
                pubDate: parseMessageDate(item.CreatedAt),
                description: detail.description || item.Summary,
                image: item.PcImage,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: `${subject.Title} - 主题 - 选股宝`,
        link,
        description: subject.Desc,
        image: subject.Image,
        item: out,
    };
}
