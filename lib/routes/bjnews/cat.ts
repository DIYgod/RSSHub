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
    parameters: { cat: '分类, 可从URL中找到' },
    features: {},
    radar: [
        {
            source: ['www.bjnews.com.cn/:cat'],
        },
    ],
    name: '分类',
    maintainers: ['dzx-dzx'],
    handler,
    url: 'www.bjnews.com.cn',
};

async function handler(ctx) {
    const url = `https://www.bjnews.com.cn/${ctx.req.param('cat')}`;
    const res = await ofetch(url);
    const $ = load(res);
    const list = $('#waterfall-container .pin_demo > a')
        .toArray()
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 15)
        .map((a) => ({
            title: $(a).text(),
            link: $(a).attr('href'),
        }));

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const responses = await ofetch(item.link);
                const $d = load(responses);
                // $d('img').each((i, e) => $(e).attr('referrerpolicy', 'no-referrer'));

                item.pubDate = timezone(parseDate($d('.left-info .timer').text()), +8);
                item.author = $d('.left-info .reporter').text();
                item.description = $d('#contentStr').html();

                return item;
            })
        )
    );
    return {
        title: $('title').text(),
        link: url,
        item: out,
    };
}
