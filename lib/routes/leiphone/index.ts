import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import utils from './utils';

export const route: Route = {
    path: '/:do?/:keyword?',
    radar: [
        {
            source: ['leiphone.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
    url: 'leiphone.com/',
};

async function handler(ctx) {
    const todo = ctx.req.param('do') ?? '';
    const keyword = ctx.req.param('keyword') ?? '';
    const rootUrl = 'https://www.leiphone.com';
    const url = `${rootUrl}/${todo}/${keyword}`;
    const res = await got.get(url);
    const $ = load(res.data);

    const list = $('.word > h3 > a')
        .slice(0, 10)
        .toArray()
        .map((e) => $(e).attr('href'));
    const items = await utils.ProcessFeed(list, cache);

    return {
        title: `雷峰网${todo === 'category' ? ` ${keyword}` : ''}`,
        description: '雷峰网 - 读懂智能&未来',
        link: url,
        item: items,
    };
}
