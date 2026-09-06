import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/checkin/:id',
    categories: ['study'],
    example: '/shanbay/checkin/ddwej',
    parameters: {
        id: '用户 id',
    },
    name: '用户打卡',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();

    const username = await cache.tryGet(`shanbayuser${id}`, async () => {
        const response = await ofetch(`https://web.shanbay.com/web/checkin/achievement?user_id=${id}`);
        const $ = load(response);
        return $('#user-info-area .name').text();
    });

    const link = `https://web.shanbay.com/web/wechat/calendar/?user_id=${id}`;
    const response = await ofetch(`https://apiv3.shanbay.com/uc/checkin/logs?page=1&user_id=${id}`, {
        headers: {
            Referer: link,
        },
    });

    return {
        title: `${username} 的扇贝打卡`,
        link,
        item: response.objects.map((item) => {
            const action = item.tasks
                .toSorted((a, b) => b.used_time - a.used_time)
                .map((task) => {
                    const minute = Math.floor(task.used_time / 60);
                    const second = task.used_time - minute * 60;
                    return `${task.operation}了 ${task.num} ${task.unit}${task.name}，学习时间 ${minute} 分 ${second} 秒`;
                })
                .join('；');
            const pubDate = timezone(parseDate(item.date), 8);

            return {
                title: `${username} 的第 ${item.checkin_days_num} 天扇贝打卡`,
                pubDate,
                guid: item.id + (pubDate.getTime() >= 1_596_729_600_000 ? action : ''),
                description: action,
                link,
            };
        }),
    };
}
