import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { ContentFetcher } from './utils';

export const route: Route = {
    path: '/:id/:type?/:sort?',
    categories: ['bbs'],
    example: '/muchong/290',
    parameters: {
        id: '板块 id，可在板块页 URL 中找到',
        type: '子类别 id，可在板块页导航栏中找到，默认为 `all` 即 全部',
        sort: '排序，可选 `order-tid` 即 发表排序，默认为 回帖排序',
    },
    features: { requirePuppeteer: true, antiCrawler: true },
    name: '分类',
    maintainers: ['nczitzk'],
    description: `::: tip
尚不支持需要登录访问的版块
:::`,
    handler,
};

async function handler(ctx: Context) {
    const { id = '', type = 'all', sort = '' } = ctx.req.param();

    const rootUrl = 'https://muchong.com';
    const decoder = new TextDecoder('gbk');
    const currentUrl = `${rootUrl}/f-${id}-1${sort === '' ? '' : '-' + sort}${type === 'all' ? '' : '-typeid-' + type}`;
    const fetcher = new ContentFetcher();
    try {
        const response = await fetcher.fetch(currentUrl);

        const $ = load(typeof response === 'string' ? response : decoder.decode(response));

        const list = $('.xmc_bpt tbody .forum_list')
            .slice(1, 10)
            .toArray()
            .map((element): DataItem & { link: string } => {
                const $item = $(element);
                return {
                    author: $item.find('.by cite a').text(),
                    link: `${rootUrl}${$item.find('.a_subject').attr('href')}`,
                    title: $item.find('.thread-name span').eq(0).text() + $item.find('.a_subject').text(),
                    pubDate: timezone(parseDate(sort === '' ? $item.find('.by cite nobr').text() : $item.find('.by .xmc_b9').eq(0).text()), 8),
                };
            });

        const items = await pMap(
            list,
            async (item) => {
                const details = await cache.tryGet(item.link, async () => {
                    const detailResponse = await fetcher.fetch(item.link);
                    const content = load(typeof detailResponse === 'string' ? detailResponse : decoder.decode(detailResponse));

                    const description = content('#pid1').find('.t_fsz').html();

                    return { description };
                });
                return { ...item, description: details.description };
            },
            { concurrency: 3, stopOnError: false }
        );

        return {
            title: $('title').text().replace('-学术科研互动平台', ''),
            link: currentUrl,
            item: items,
        };
    } catch (error) {
        if (error instanceof AggregateError && error.errors.length) {
            throw error.errors[0];
        }
        throw error;
    } finally {
        await fetcher.destroy();
    }
}
