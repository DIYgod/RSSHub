import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

import { author, language, processItems, rootUrl } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const { name } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL(`article-list/1?tagName=${name}`, rootUrl).href;
    const apiUrl: string = new URL('api/articles/tagId', rootUrl).href;

    const apiResponse = await ofetch(apiUrl, {
        query: {
            datasrc: 'tagid',
            tagname: name,
            current: 1,
            size: limit,
        },
    });

    const items: DataItem[] = processItems(apiResponse.data.records, limit);

    return {
        title: `${author} - ${name}`,
        description: name,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author,
        language,
    };
};

export const route: Route = {
    path: '/n/tag/:name',
    name: '盐选故事专栏',
    url: 'n.ifun.cool',
    maintainers: ['nczitzk'],
    handler,
    example: '/ifun/n/tag/zhihu',
    parameters: {
        name: '专栏 id，可在对应专栏页 URL 中找到',
    },
    description: `::: tip
若订阅 [zhihu](https://n.ifun.cool/article-list/2?tagName=zhihu)，网址为 \`https://n.ifun.cool/article-list/2?tagName=zhihu\`，请截取 \`tagName\` 的值 \`zhihu\` 作为 \`name\` 参数填入，此时目标路由为 [\`/ifun/n/tag/zhihu\`](https://rsshub.app/ifun/n/tag/zhihu)。

更多专栏请见 [盐选故事专栏](https://n.ifun.cool/tags)。
:::
    `,
    categories: ['new-media'],
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
            source: ['n.ifun.cool/article-list/1'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const name = urlObj.searchParams.get('tagName');

                return `/ifun/n/tag/${name}`;
            },
        },
    ],
    view: ViewType.Articles,
};
