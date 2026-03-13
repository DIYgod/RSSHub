import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

import { processItems, rootUrl } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const { filter } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL(`/${filter ? 'home/' : ''}explore/${filter ?? ''}`, rootUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language: string = $('html').prop('lang') ?? 'zh';

    const items: DataItem[] = await processItems($, $('div.aw-question-list'), limit);

    $('div.pagination').remove();

    const author = $('meta[name="keywords"]').prop('content').split(/,/)[0];
    const feedImage = $('div.aw-logo img').prop('src');

    return {
        title: `${$('title').text()} - ${$('li.active')
            .slice(1)
            .toArray()
            .map((l) => $(l).text())
            .join('|')}`,
        description: $('meta[name="description"]').prop('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: feedImage,
        author,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/explore/:filter?',
    name: '广场',
    url: 'www.jisilu.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/jisilu/explore',
    parameters: {
        category: '过滤器，默认为空，可在对应页 URL 中找到',
    },
    description: `::: tip
若订阅 [债券/可转债 - 热门 - 30天](https://www.jisilu.cn/home/explore/category-4__sort_type-hot__day-30)，网址为 \`https://www.jisilu.cn/home/explore/category-4__sort_type-hot__day-30\`，请截取 \`https://www.jisilu.cn/home/explore/\` 到末尾的部分 \`category-4__sort_type-hot__day-30\` 作为 \`filter\` 参数填入，此时目标路由为 [\`/jisilu/explore/category-4__sort_type-hot__day-30\`](https://rsshub.app/jisilu/explore/category-4__sort_type-hot__day-30)。
:::
    `,
    categories: ['finance'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.jisilu.cn/home/explore/:filter', 'www.jisilu.cn/home/explore', 'www.jisilu.cn/explore'],
            target: (params) => {
                const filter = params.filter;

                return `/jisilu/explore${filter ? `/${filter}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,
};
