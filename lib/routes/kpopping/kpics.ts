import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const filter = ctx.req.param('filter');
    const params = new URLSearchParams(filter);

    const apiUrl = new URL('https://kpopping.com/api/photos');
    apiUrl.search = params.toString();

    const response = await ofetch(apiUrl.href);

    const items: DataItem[] = response.map((item: any) => {
        const title: string = item.title;
        const description = renderDescription({
            images: item.src ? [{ src: item.src, alt: title }] : undefined,
        });
        const link = `https://kpopping.com/kpics/${item.slug}`;
        const dateStr = item.photoDate ?? item.createdAt;
        const pubDate = dateStr ? parseDate(dateStr) : undefined;
        const author = item.uploaderName || item.idolName;
        const category = item.category;

        return {
            title,
            description,
            link,
            pubDate,
            category,
            author,
            content: {
                html: description,
                text: description,
            },
            image: item.src,
            banner: item.src,
        };
    });

    return {
        title: 'kpics - kpopping',
        link: 'https://kpopping.com/kpics',
        item: items,
        language: 'en',
    };
};

export const route: Route = {
    path: '/kpics/:filter{.+}?',
    name: 'Pics',
    url: 'kpopping.com',
    maintainers: ['nczitzk', 'pinapelz'],
    handler,
    example: '/kpopping/kpics/gender=female&category=musicshow&idolId=a1664634-5caf-45d3-a57f-49d99d929aa9',
    parameters: {
        filter: 'Filter parameters in `key=value&key2=value2` format. Supported keys: `category`, `gender`, `sort`, `entityType`, `idolId`, `groupId`',
    },
    description: `::: tip
Query photos using filter parameters found on kpopping such as \`idolId\`, \`groupId\`, \`gender\`, \`category\`, \`sort\`, etc.
:::`,
    categories: ['picture'],
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
            source: ['kpopping.com/kpics'],
            target: '/kpics',
        },
    ],
    view: ViewType.Pictures,

    zh: {
        path: '/kpics/:filter{.+}?',
        name: 'Pics',
        url: 'kpopping.com',
        maintainers: ['nczitzk', 'pinapelz'],
        handler,
        example: '/kpopping/kpics/gender=female&category=musicshow&idolId=43012da1-8edb-4ca4-b060-9c0c1777c159',
        parameters: {
            filter: '以 `key=value&key2=value2` 格式传递的过滤参数。支持的 key 包括 `category`、`gender`、`sort`、`entityType`、`idolId`、`groupId`',
        },
        description: `::: tip
支持通过 \`idolId\`、\`groupId\`、\`gender\`、\`category\`、\`sort\` 等过滤条件获取照片。
:::`,
    },
};
