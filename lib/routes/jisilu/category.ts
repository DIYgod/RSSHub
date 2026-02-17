import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

import { processItems, rootUrl } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id } = ctx.req.param();

    if (!id) {
        throw new InvalidParameterError('请填入合法的分类 id，参见广场 https://www.jisilu.cn/explore/');
    }

    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL(`/category/${id}`, rootUrl).href;

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
    path: '/category/:id',
    name: '分类',
    url: 'www.jisilu.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/jisilu/category/4',
    parameters: {
        id: '分类 id，可在对应分类页 URL 中找到',
    },
    description: `::: tip
若订阅 [债券/可转债](https://www.jisilu.cn/category/4)，网址为 \`https://www.jisilu.cn/category/4\`，请截取 \`https://www.jisilu.cn/category/\` 到末尾的部分 \`4\` 作为 \`id\` 参数填入，此时目标路由为 [\`/jisilu/category/4\`](https://rsshub.app/jisilu/category/4)。
:::

| 新股 | 债券/可转债 | 套利 | 其他 | 基金 | 股票 |
| ---- | ----------- | ---- | ---- | ---- | ---- |
| 3    | 4           | 5    | 6    | 7    | 8    |
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
            source: ['www.jisilu.cn/category/:id'],
            target: '/category/:id',
        },
        {
            title: '新股',
            source: ['www.jisilu.cn/category/3'],
            target: '/category/3',
        },
        {
            title: '债券/可转债',
            source: ['www.jisilu.cn/category/4'],
            target: '/category/4',
        },
        {
            title: '套利',
            source: ['www.jisilu.cn/category/5'],
            target: '/category/5',
        },
        {
            title: '其他',
            source: ['www.jisilu.cn/category/6'],
            target: '/category/6',
        },
        {
            title: '基金',
            source: ['www.jisilu.cn/category/7'],
            target: '/category/7',
        },
        {
            title: '股票',
            source: ['www.jisilu.cn/category/8'],
            target: '/category/8',
        },
    ],
    view: ViewType.Articles,
};
