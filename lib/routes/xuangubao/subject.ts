import type { Context } from 'hono';

import type { Route } from '@/types';
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

async function handler(ctx: Context) {
    const { subject_id } = ctx.req.param();

    const link = `https://xuangubao.cn/subject/${subject_id}`;
    const response = await ofetch(`https://api.xuangubao.cn/api/pc/subj/${subject_id}?limit=20`, {
        headers: {
            Referer: link,
        },
    });

    const subject = response.Subject;

    const out = await Promise.all(
        response.Messages.map((item) =>
            cache.tryGet(item.Url, async () => {
                const detail = await ofetch(`https://baoer-api-prod.xuangubao.cn/baoer_backend/api/messages/show/v2/${item.Id}?subjectId=${subject_id}`, {
                    headers: {
                        Referer: `https://m.xuangubao.cn/subject/${subject_id}`,
                    },
                });
                return {
                    title: item.Title,
                    link: item.Url || item.ShareUrl2,
                    pubDate: parseDate(item.CreatedAt, 'X'),
                    description: detail.Content || item.Summary,
                    image: item.PcImage,
                };
            })
        )
    );

    return {
        title: `${subject.Title} - 主题 - 选股宝`,
        link,
        description: subject.Desc,
        image: subject.Image,
        item: out,
    };
}
