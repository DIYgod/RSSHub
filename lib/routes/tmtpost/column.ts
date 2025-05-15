import { type Data, type Route, ViewType } from '@/types';

import { type Context } from 'hono';

import { baseUrl, apiBaseUrl, processItems } from './util';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const targetUrl: string = new URL(`column/${id}`, baseUrl).href;
    const listApiUrl: string = new URL('v1/categories/multi_content/list', apiBaseUrl).href;

    const query = {
        subtype: 'post',
        category_guid: id,
    };

    return await processItems(limit, query, listApiUrl, targetUrl);
};

export const route: Route = {
    path: '/column/:id',
    name: '最新',
    url: 'www.tmtpost.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/tmtpost/column/6916385',
    parameters: {
        id: {
            description: '专栏 id，可在对应专栏页 URL 中找到',
            options: [
                {
                    label: 'AGI',
                    value: '6916385',
                },
                {
                    label: '出海',
                    value: '6998081',
                },
                {
                    label: '创新场景',
                    value: '3882035',
                },
                {
                    label: '钛度号',
                    value: '6100587',
                },
                {
                    label: '深度',
                    value: '3189960',
                },
                {
                    label: '焦点',
                    value: '6043895',
                },
                {
                    label: '创投',
                    value: '5994956',
                },
                {
                    label: '汽车',
                    value: '2573550',
                },
                {
                    label: '3C',
                    value: '3615534',
                },
                {
                    label: '消费',
                    value: '3882530',
                },
                {
                    label: '大健康',
                    value: '3882507',
                },
                {
                    label: '金融',
                    value: '3882486',
                },
                {
                    label: '钛智宏观',
                    value: '4277188',
                },
                {
                    label: '产业研究',
                    value: '5506730',
                },
                {
                    label: '地产',
                    value: '3882499',
                },
                {
                    label: '大公司',
                    value: '2446153',
                },
                {
                    label: 'IPO',
                    value: '6043750',
                },
                {
                    label: '钛度图闻',
                    value: '5750087',
                },
                {
                    label: '城视',
                    value: '6998636',
                },
                {
                    label: '创业家',
                    value: '4273329',
                },
                {
                    label: '人文',
                    value: '6252390',
                },
                {
                    label: '新职业研究所',
                    value: '5750104',
                },
                {
                    label: '科普',
                    value: '5714992',
                },
                {
                    label: '文娱',
                    value: '2446157',
                },
            ],
        },
    },
    description: `:::tip
若订阅 [AGI](https://www.tmtpost.com/column/6916385)，网址为 \`https://www.tmtpost.com/column/6916385\`，请截取 \`https://www.tmtpost.com/column\` 到末尾的部分 \`6916385\` 作为 \`id\` 参数填入，此时目标路由为 [\`/tmtpost/column/6916385\`](https://rsshub.app/tmtpost/column/6916385)。
:::

<details>
  <summary>更多分类</summary>

  | [AGI](https://www.tmtpost.com/column/6916385)        | [出海](https://www.tmtpost.com/column/6998081)       | [创新场景](https://www.tmtpost.com/column/3882035)   | [钛度号](https://www.tmtpost.com/column/6100587)     | [深度](https://www.tmtpost.com/column/3189960)       |
  | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
  | [6916385](https://rsshub.app/tmtpost/column/6916385) | [6998081](https://rsshub.app/tmtpost/column/6998081) | [3882035](https://rsshub.app/tmtpost/column/3882035) | [6100587](https://rsshub.app/tmtpost/column/6100587) | [3189960](https://rsshub.app/tmtpost/column/3189960) |

  | [焦点](https://www.tmtpost.com/column/6043895)       | [创投](https://www.tmtpost.com/column/5994956)       | [汽车](https://www.tmtpost.com/column/2573550)       | [3C](https://www.tmtpost.com/column/3615534)         | [消费](https://www.tmtpost.com/column/3882530)       |
  | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
  | [6043895](https://rsshub.app/tmtpost/column/6043895) | [5994956](https://rsshub.app/tmtpost/column/5994956) | [2573550](https://rsshub.app/tmtpost/column/2573550) | [3615534](https://rsshub.app/tmtpost/column/3615534) | [3882530](https://rsshub.app/tmtpost/column/3882530) |

  | [大健康](https://www.tmtpost.com/column/3882507)     | [金融](https://www.tmtpost.com/column/3882486)       | [钛智宏观](https://www.tmtpost.com/column/4277188)   | [产业研究](https://www.tmtpost.com/column/5506730)   | [地产](https://www.tmtpost.com/column/3882499)       |
  | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
  | [3882507](https://rsshub.app/tmtpost/column/3882507) | [3882486](https://rsshub.app/tmtpost/column/3882486) | [4277188](https://rsshub.app/tmtpost/column/4277188) | [5506730](https://rsshub.app/tmtpost/column/5506730) | [3882499](https://rsshub.app/tmtpost/column/3882499) |

  | [大公司](https://www.tmtpost.com/column/2446153)     | [IPO](https://www.tmtpost.com/column/6043750)        | [钛度图闻](https://www.tmtpost.com/column/5750087)   | [城视](https://www.tmtpost.com/column/6998636)       | [创业家](https://www.tmtpost.com/column/4273329)     |
  | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
  | [2446153](https://rsshub.app/tmtpost/column/2446153) | [6043750](https://rsshub.app/tmtpost/column/6043750) | [5750087](https://rsshub.app/tmtpost/column/5750087) | [6998636](https://rsshub.app/tmtpost/column/6998636) | [4273329](https://rsshub.app/tmtpost/column/4273329) |

  | [人文](https://www.tmtpost.com/column/6252390)       | [新职业研究所](https://www.tmtpost.com/column/5750104) | [科普](https://www.tmtpost.com/column/5714992)       | [文娱](https://www.tmtpost.com/column/2446157)       |
  | ---------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------- |
  | [6252390](https://rsshub.app/tmtpost/column/6252390) | [5750104](https://rsshub.app/tmtpost/column/5750104)   | [5714992](https://rsshub.app/tmtpost/column/5714992) | [2446157](https://rsshub.app/tmtpost/column/2446157) |

</details>
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
            source: ['www.tmtpost.com/column/:id'],
            target: '/column/:id',
        },
        {
            title: 'AGI',
            source: ['www.tmtpost.com/column/6916385'],
            target: '/column/6916385',
        },
        {
            title: '出海',
            source: ['www.tmtpost.com/column/6998081'],
            target: '/column/6998081',
        },
        {
            title: '创新场景',
            source: ['www.tmtpost.com/column/3882035'],
            target: '/column/3882035',
        },
        {
            title: '钛度号',
            source: ['www.tmtpost.com/column/6100587'],
            target: '/column/6100587',
        },
        {
            title: '深度',
            source: ['www.tmtpost.com/column/3189960'],
            target: '/column/3189960',
        },
        {
            title: '焦点',
            source: ['www.tmtpost.com/column/6043895'],
            target: '/column/6043895',
        },
        {
            title: '创投',
            source: ['www.tmtpost.com/column/5994956'],
            target: '/column/5994956',
        },
        {
            title: '汽车',
            source: ['www.tmtpost.com/column/2573550'],
            target: '/column/2573550',
        },
        {
            title: '3C',
            source: ['www.tmtpost.com/column/3615534'],
            target: '/column/3615534',
        },
        {
            title: '消费',
            source: ['www.tmtpost.com/column/3882530'],
            target: '/column/3882530',
        },
        {
            title: '大健康',
            source: ['www.tmtpost.com/column/3882507'],
            target: '/column/3882507',
        },
        {
            title: '金融',
            source: ['www.tmtpost.com/column/3882486'],
            target: '/column/3882486',
        },
        {
            title: '钛智宏观',
            source: ['www.tmtpost.com/column/4277188'],
            target: '/column/4277188',
        },
        {
            title: '产业研究',
            source: ['www.tmtpost.com/column/5506730'],
            target: '/column/5506730',
        },
        {
            title: '地产',
            source: ['www.tmtpost.com/column/3882499'],
            target: '/column/3882499',
        },
        {
            title: '大公司',
            source: ['www.tmtpost.com/column/2446153'],
            target: '/column/2446153',
        },
        {
            title: 'IPO',
            source: ['www.tmtpost.com/column/6043750'],
            target: '/column/6043750',
        },
        {
            title: '钛度图闻',
            source: ['www.tmtpost.com/column/5750087'],
            target: '/column/5750087',
        },
        {
            title: '城视',
            source: ['www.tmtpost.com/column/6998636'],
            target: '/column/6998636',
        },
        {
            title: '创业家',
            source: ['www.tmtpost.com/column/4273329'],
            target: '/column/4273329',
        },
        {
            title: '人文',
            source: ['www.tmtpost.com/column/6252390'],
            target: '/column/6252390',
        },
        {
            title: '新职业研究所',
            source: ['www.tmtpost.com/column/5750104'],
            target: '/column/5750104',
        },
        {
            title: '科普',
            source: ['www.tmtpost.com/column/5714992'],
            target: '/column/5714992',
        },
        {
            title: '文娱',
            source: ['www.tmtpost.com/column/2446157'],
            target: '/column/2446157',
        },
    ],
    view: ViewType.Articles,
};
