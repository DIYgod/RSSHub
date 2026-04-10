import type { Data } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const cnNewsHander = async (limit: number) => {
    const response = await ofetch('https://www.fcbayern.cn/api2018/news/list', {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            page: '1',
            pageSize: String(limit),
            totalPage: '1',
            tagId: '',
            year: '-1',
            month: '-1',
            type: '1',
        }),
    });

    const items = response.data.map((item) => ({
        title: item.title,
        link: item.url,
        pubDate: timezone(parseDate(item.time), 8),
        image: item.pic?.split('?')[0],
    }));

    return {
        title: '拜仁慕尼黑俱乐部中文官方网站 - 新闻',
        link: 'https://www.fcbayern.cn/news',
        item: items,
    } satisfies Data;
};
