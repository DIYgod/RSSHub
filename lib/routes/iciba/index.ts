import dayjs from 'dayjs';
import timezonePlugin from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

dayjs.extend(utc);
dayjs.extend(timezonePlugin);

type DailySentence = {
    content: string;
    note: string;
    picture2: string;
    picture3: string;
    picture4: string;
    fenxiang_img: string;
    dateline: string;
    tts: string;
};

export const route: Route = {
    path: '/:days?/:img_type?',
    categories: ['study'],
    example: '/iciba/7/poster',
    parameters: { days: 'number of items to show (min = 1, max = 7, default = 1)', img_type: 'image style' },
    description: `| \`:img_type\` | image style    |
| ----------- | -------------- |
| original    | Original size  |
| medium      | Medium size    |
| thumbnail   | Thumbnail size |
| poster      | Art poster     |`,
    name: 'Daily English Sentence',
    maintainers: ['mashirozx'],
    handler,
};

async function handler(ctx: Context) {
    const { days: daysParam, img_type: imgTypeParam } = ctx.req.param();
    const days = Math.min(Math.max(Number.parseInt(daysParam) || 1, 1), 7);

    const imgTypes = {
        original: 'picture4',
        medium: 'picture2',
        thumbnail: 'picture3',
        poster: 'fenxiang_img',
    } as const;
    const imgType = imgTypes[imgTypeParam] ?? imgTypes.original;

    const data = await Promise.all(
        Array.from({ length: days }, (_, x) => {
            const date = dayjs().tz('Asia/Shanghai').subtract(x, 'day').format('YYYY-MM-DD');
            const link = `https://open.iciba.com/dsapi/?date=${date}`;
            return cache.tryGet(link, () => ofetch<DailySentence>(link, { parseResponse: JSON.parse }));
        })
    );

    return {
        title: '金山词霸每日一句',
        link: 'https://news.iciba.com/',
        itunes_author: '金山词霸每日一句',
        itunes_category: 'Learn English',
        image: data[0].picture3,
        item: data.map((item) => ({
            title: item.content,
            description: `${item.content}<br>${item.note}<br><img src="${item[imgType]}">`,
            pubDate: timezone(parseDate(item.dateline), 8),
            link: `http://news.iciba.com/views/dailysentence/daily.html#!/detail/title/${item.dateline}`,
            itunes_item_image: item.picture3,
            enclosure_url: item.tts,
            enclosure_type: 'audio/mpeg',
        })),
    };
}
