import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

import { processItems, rootUrl } from './util';

const actions: { [key: string]: string } = {
    questions: '101',
    answers: '201',
};

export const handler = async (ctx: Context): Promise<Data> => {
    const { id, type = 'questions' } = ctx.req.param();

    if (type && type !== 'answers' && type !== 'questions') {
        throw new InvalidParameterError('请填入合法的类型 id，可选值为 `questions` 即 `主题` 或 `answer` 即 `回复`，默认为空，即全部');
    }

    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL(`/people/${id}`, rootUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language: string = $('html').prop('lang') ?? 'zh';
    const userId: string | undefined = response.match(/var\sPEOPLE_USER_ID\s=\s'(\d+)';/)?.[1];

    if (!userId) {
        throw new InvalidParameterError('请填入合法的用户 id，参见用户排名 https://www.jisilu.cn/users/');
    }

    const apiUrl: string = new URL(`people/ajax/user_actions/uid-${userId}__actions-${actions[type]}__page-1`, rootUrl).href;

    const detailResponse = await ofetch(apiUrl);
    const $$: CheerioAPI = load(detailResponse);

    const items: DataItem[] = await processItems($$, $$('*'), limit);

    const author = $('meta[name="keywords"]').prop('content').split(/,/)[0];
    const feedImage = $('div.aw-logo img').prop('src');

    return {
        title: `${$('title').text()}${type ? ` - ${$(`div#${type} h3`).text()}` : ''}`,
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
    path: '/people/:id/:type?',
    name: '用户',
    url: 'www.jisilu.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/jisilu/people/天书',
    parameters: {
        id: '用户 id，可在对应用户页 URL 中找到',
        type: '类型，可选值为 `questions` 即 `主题` 或 `answer` 即 `回复`，默认为 `questions` 即 `主题`',
    },
    description: `::: tip
若订阅 [天书的主题](https://www.jisilu.cn/people/天书)，网址为 \`https://www.jisilu.cn/people/天书\`，请截取 \`https://www.jisilu.cn/people/\` 到末尾的部分 \`天书\` 作为 \`id\` 参数填入，此时目标路由为 [\`/jisilu/people/天书\`](https://rsshub.app/jisilu/people/天书)。
:::

::: tip
前往 [用户排名](https://www.jisilu.cn/users/) 查看更多用户。
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
            source: ['www.jisilu.cn/people/:id'],
            target: '/people/:id',
        },
    ],
    view: ViewType.Articles,
};
