import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:cat',
    categories: ['traditional-media'],
    example: '/bjnews/depth',
    parameters: {},
    features: {},
    radar: [
        {
            source: ['www.bjnews.com.cn/:cat'],
        },
    ],
    name: '分类',
    maintainers: [''],
    handler,
    url: 'www.bjnews.com.cn',
};

async function handler(ctx) {
    const url = `https://www.bjnews.com.cn/${ctx.req.param('cat')}`;
    const res = await ofetch(url);
    const $ = load(res);
    const list = $('#waterfall-container .pin_demo > a')
        .toArray()
        .map((a) => ({
            title: $(a).text(),
            link: $(a).attr('href'),
        }))
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 15);

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const responses = await ofetch(item.link);
                const $d = load(responses);
                // $d('img').each((i, e) => $(e).attr('referrerpolicy', 'no-referrer'));

                const single = {
                    ...item,
                    pubDate: timezone(parseDate($d('.left-info .timer').text()), +8),
                    author: $d('.left-info .reporter').text(),
                    description: $d('#contentStr').html(),
                };
                return single;
            })
        )
    );
    return {
        title: $('title').text(),
        link: url,
        item: out,
    };
}
