import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/search/:limit?/:form?/:class?/:title?',
    categories: ['study'],
    example: '/ctfhub/search',
    parameters: {
        limit: '一个整数，筛选最新的 limit 场比赛，默认为 10',
        form: '比赛形式',
        class: '比赛类型',
        title: '通过 CTF 赛事名称过滤',
    },
    description: `| \`:class\` | 类型                               |
| :------: | ---------------------------------- |
|     0    | Jeopardy \\[解题]                   |
|     1    | Attack with Defense \\[AwD 攻防]    |
|     2    | Robo Hacking Game \\[RHG AI 自动化] |
|     3    | Real World \\[RW 真实世界]          |
|     4    | King of The Hill \\[KoH 抢占山头]   |
|     5    | Mix \\[混合]                        |

> class 以 <https://api.ctfhub.com/User_API/Event/getType> 的返回结果为准

| \`:form\` | 形式   |
| :-----: | ------ |
|    0    | 线上赛 |
|    1    | 线下赛 |`,
    name: '查询国内外 CTF 赛事信息',
    maintainers: ['frankli0324'],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const host = 'https://api.ctfhub.com';
    const { limit = '10', form, class: className, title } = ctx.req.param();

    const like: Record<string, string> = {};
    if (title !== undefined) {
        like.title = title;
    }
    if (form !== undefined) {
        like.form = ['线上', '线下'][Number.parseInt(form)];
    }
    if (className !== undefined) {
        const types = await ofetch(`${host}/User_API/Event/getType`, { method: 'POST', body: {} });
        like.class = types.data[className];
    }

    const opt = {
        ...(Object.keys(like).length > 0 && { like }),
        offset: 0,
        limit: Number.parseInt(limit),
    };

    const response = await ofetch(`${host}/User_API/Event/getAll`, { method: 'POST', body: opt });

    if (response.status !== true) {
        throw new Error('CTFHub API returned an error');
    }

    return {
        title: 'CTFHub Calendar',
        link: 'https://www.ctfhub.com/#/calendar',
        description: '提供全网最全最新的 CTF 赛事信息，关注赛事定制自己专属的比赛日历吧。',
        item: response.data.items.map((item) => ({
            title: item.title,
            description: '',
            pubDate: parseDate(item.start_time * 1000),
            link: item.official_url,
        })),
    };
}
