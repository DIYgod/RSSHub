import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

import { processItems, rootUrl } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id } = ctx.req.param();

    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL(`/topic/${id}`, rootUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language: string = $('html').prop('lang') ?? 'zh';

    const items: DataItem[] = await processItems($, $('div.aw-question-list'), limit);

    $('div.pagination').remove();

    const author = $('meta[name="keywords"]').prop('content').split(/,/)[0];
    const feedImage = $('div.aw-logo img').prop('src');

    return {
        title: $('title').text(),
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
    path: '/topic/:id',
    name: '话题',
    url: 'www.jisilu.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/jisilu/topic/可转债',
    parameters: {
        id: '话题 id，可在对应话题页 URL 中找到',
    },
    description: `::: tip
若订阅 [可转债](https://www.jisilu.cn/topic/可转债)，网址为 \`https://www.jisilu.cn/topic/可转债\`，请截取 \`https://www.jisilu.cn/topic/\` 到末尾的部分 \`可转债\` 作为 \`id\` 参数填入，此时目标路由为 [\`/jisilu/topic/可转债\`](https://rsshub.app/jisilu/topic/可转债)。
:::

::: tip
前往 [话题广场](https://www.jisilu.cn/topic) 查看更多话题。
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
            source: ['www.jisilu.cn/topic/:id'],
            target: '/topic/:id',
        },
    ],
    view: ViewType.Articles,
};
