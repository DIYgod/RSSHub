import { type Data, type Route, ViewType } from '@/types';

import { type Context } from 'hono';

export const handler = (ctx: Context): Data | undefined => {
    const { id } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '20', 10);

    ctx.set('redirect', `/iresearch/report/3${id ? `/${id}` : ''}?limit=${limit}`);
    return;
};

export const route: Route = {
    path: '/weekly/:id?',
    name: '周度市场观察',
    url: 'www.iresearch.com.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/iresearch/weekly',
    parameters: {
        id: {
            description: '行业 ID，默认为全部，即全部行业，可在对应行业页 URL 中找到',
            options: [
                {
                    label: '全部',
                    value: '',
                },
                {
                    label: '家电行业',
                    value: '1',
                },
                {
                    label: '服装行业',
                    value: '2',
                },
                {
                    label: '美妆行业',
                    value: '3',
                },
                {
                    label: '食品饮料行业',
                    value: '4',
                },
                {
                    label: '酒行业',
                    value: '5',
                },
            ],
        },
    },
    description: `:::tip
订阅 [家电行业](https://www.iresearch.com.cn/report.shtml?type=3&classId=1)，其源网址为 \`https://www.iresearch.com.cn/report.shtml?type=3&classId=1\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/iresearch/weekly/家电行业\`](https://rsshub.app/iresearch/weekly/家电行业) 或 [\`/iresearch/weekly/1\`](https://rsshub.app/iresearch/weekly/1)。
:::

| 名称                                                                       | ID                                           |
| -------------------------------------------------------------------------- | -------------------------------------------- |
| [家电行业](https://www.iresearch.com.cn/report.shtml?type=3&classId=1)     | [1](https://rsshub.app/iresearch/report/3/1) |
| [服装行业](https://www.iresearch.com.cn/report.shtml?type=3&classId=2)     | [2](https://rsshub.app/iresearch/report/3/2) |
| [美妆行业](https://www.iresearch.com.cn/report.shtml?type=3&classId=3)     | [3](https://rsshub.app/iresearch/report/3/3) |
| [食品饮料行业](https://www.iresearch.com.cn/report.shtml?type=3&classId=4) | [4](https://rsshub.app/iresearch/report/3/4) |
| [酒行业](https://www.iresearch.com.cn/report.shtml?type=3&classId=5)       | [5](https://rsshub.app/iresearch/report/3/5) |
`,
    categories: ['other'],
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
            source: ['www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const id: string | undefined = urlObj.searchParams.get('classId') ?? urlObj.searchParams.get('channelId') ?? urlObj.searchParams.get('cid') ?? undefined;

                return `/iresearch/weekly${id ? `/${id}` : ''}`;
            },
        },
        {
            title: '家电行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/weekly/1',
        },
        {
            title: '服装行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/weekly/2',
        },
        {
            title: '美妆行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/weekly/3',
        },
        {
            title: '食品饮料行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/weekly/4',
        },
        {
            title: '酒行业',
            source: ['www.iresearch.com.cn/report.shtml'],
            target: '/weekly/5',
        },
    ],
    view: ViewType.Articles,
};
