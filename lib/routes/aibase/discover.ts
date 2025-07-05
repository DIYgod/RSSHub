import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

import { rootUrl, buildApiUrl, processItems } from './util';

export const handler = async (ctx) => {
    const { id } = ctx.req.param();

    const [pid, sid] = id?.split(/-/) ?? [undefined, undefined];

    const limit = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const currentUrl = new URL(`discover${id ? `/${id}` : ''}`, rootUrl).href;

    const currentHtml = await ofetch(currentUrl);

    const $ = load(currentHtml);

    const { apiRecommListUrl, apiRecommProcUrl, apiTagProcUrl } = await buildApiUrl($);

    let ptag, stag;
    let isTag = !!(pid && sid);

    if (isTag) {
        const apiRecommList = await ofetch(apiRecommListUrl);

        const recommList = apiRecommList?.data?.results ?? [];

        const parentTag = recommList.find((t) => String(t.Id) === pid);
        const subTag = parentTag ? parentTag.sublist.find((t) => String(t.Id) === sid) : undefined;

        ptag = parentTag?.tag ?? parentTag?.alias ?? undefined;
        stag = subTag?.tag ?? subTag?.alias ?? undefined;

        isTag = !!(ptag && stag);
    }

    const query = {
        page: 1,
        pagesize: limit,
        ticket: '',
    };

    const {
        data: { results: apiProcs },
    } = await (isTag
        ? ofetch(apiRecommProcUrl, {
              query: {
                  ...query,
                  ptag,
                  stag,
              },
          })
        : ofetch(apiTagProcUrl, {
              query: {
                  ...query,
                  f: 'id',
                  o: 'desc',
              },
          }));

    const items = processItems(apiProcs?.slice(0, limit) ?? []);

    const image = new URL($('img.logo').prop('src'), rootUrl).href;

    const author = $('title').text().split(/_/).pop();

    return {
        title: `${author}${isTag ? ` | ${ptag} - ${stag}` : ''}`,
        description: $('meta[property="og:description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author,
    };
};

export const route: Route = {
    path: '/discover/:id?',
    name: '发现',
    url: 'top.aibase.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/aibase/discover',
    parameters: { id: '发现分类，默认为空，即全部产品，可在对应发现分类页 URL 中找到' },
    description: `::: tip
  若订阅 [图片背景移除](https://top.aibase.com/discover/37-49)，网址为 \`https://top.aibase.com/discover/37-49\`。截取 \`https://top.aibase.com/discover/\` 到末尾的部分 \`37-49\` 作为参数填入，此时路由为 [\`/aibase/discover/37-49\`](https://rsshub.app/aibase/discover/37-49)。
:::

<details>
<summary>更多分类</summary>

#### 图像处理

| 分类                                                  | ID                                                |
| ----------------------------------------------------- | ------------------------------------------------- |
| [图片背景移除](https://top.aibase.com/discover/37-49) | [37-49](https://rsshub.app/aibase/discover/37-49) |
| [图片无损放大](https://top.aibase.com/discover/37-50) | [37-50](https://rsshub.app/aibase/discover/37-50) |
| [图片AI修复](https://top.aibase.com/discover/37-51)   | [37-51](https://rsshub.app/aibase/discover/37-51) |
| [图像生成](https://top.aibase.com/discover/37-52)     | [37-52](https://rsshub.app/aibase/discover/37-52) |
| [Ai图片拓展](https://top.aibase.com/discover/37-53)   | [37-53](https://rsshub.app/aibase/discover/37-53) |
| [Ai漫画生成](https://top.aibase.com/discover/37-54)   | [37-54](https://rsshub.app/aibase/discover/37-54) |
| [Ai生成写真](https://top.aibase.com/discover/37-55)   | [37-55](https://rsshub.app/aibase/discover/37-55) |
| [电商图片制作](https://top.aibase.com/discover/37-83) | [37-83](https://rsshub.app/aibase/discover/37-83) |
| [Ai图像转视频](https://top.aibase.com/discover/37-86) | [37-86](https://rsshub.app/aibase/discover/37-86) |

#### 视频创作

| 分类                                                | ID                                                |
| --------------------------------------------------- | ------------------------------------------------- |
| [视频剪辑](https://top.aibase.com/discover/38-56)   | [38-56](https://rsshub.app/aibase/discover/38-56) |
| [生成视频](https://top.aibase.com/discover/38-57)   | [38-57](https://rsshub.app/aibase/discover/38-57) |
| [Ai动画制作](https://top.aibase.com/discover/38-58) | [38-58](https://rsshub.app/aibase/discover/38-58) |
| [字幕生成](https://top.aibase.com/discover/38-84)   | [38-84](https://rsshub.app/aibase/discover/38-84) |

#### 效率助手

| 分类                                                | ID                                                |
| --------------------------------------------------- | ------------------------------------------------- |
| [AI文档工具](https://top.aibase.com/discover/39-59) | [39-59](https://rsshub.app/aibase/discover/39-59) |
| [PPT](https://top.aibase.com/discover/39-60)        | [39-60](https://rsshub.app/aibase/discover/39-60) |
| [思维导图](https://top.aibase.com/discover/39-61)   | [39-61](https://rsshub.app/aibase/discover/39-61) |
| [表格处理](https://top.aibase.com/discover/39-62)   | [39-62](https://rsshub.app/aibase/discover/39-62) |
| [Ai办公助手](https://top.aibase.com/discover/39-63) | [39-63](https://rsshub.app/aibase/discover/39-63) |

#### 写作灵感

| 分类                                              | ID                                                |
| ------------------------------------------------- | ------------------------------------------------- |
| [文案写作](https://top.aibase.com/discover/40-64) | [40-64](https://rsshub.app/aibase/discover/40-64) |
| [论文写作](https://top.aibase.com/discover/40-88) | [40-88](https://rsshub.app/aibase/discover/40-88) |

#### 艺术灵感

| 分类                                                | ID                                                |
| --------------------------------------------------- | ------------------------------------------------- |
| [音乐创作](https://top.aibase.com/discover/41-65)   | [41-65](https://rsshub.app/aibase/discover/41-65) |
| [设计创作](https://top.aibase.com/discover/41-66)   | [41-66](https://rsshub.app/aibase/discover/41-66) |
| [Ai图标生成](https://top.aibase.com/discover/41-67) | [41-67](https://rsshub.app/aibase/discover/41-67) |

#### 趣味

| 分类                                                  | ID                                                |
| ----------------------------------------------------- | ------------------------------------------------- |
| [Ai名字生成器](https://top.aibase.com/discover/42-68) | [42-68](https://rsshub.app/aibase/discover/42-68) |
| [游戏娱乐](https://top.aibase.com/discover/42-71)     | [42-71](https://rsshub.app/aibase/discover/42-71) |
| [其他](https://top.aibase.com/discover/42-72)         | [42-72](https://rsshub.app/aibase/discover/42-72) |

#### 开发编程

| 分类                                                | ID                                                |
| --------------------------------------------------- | ------------------------------------------------- |
| [开发编程](https://top.aibase.com/discover/43-73)   | [43-73](https://rsshub.app/aibase/discover/43-73) |
| [Ai开放平台](https://top.aibase.com/discover/43-74) | [43-74](https://rsshub.app/aibase/discover/43-74) |
| [Ai算力平台](https://top.aibase.com/discover/43-75) | [43-75](https://rsshub.app/aibase/discover/43-75) |

#### 聊天机器人

| 分类                                              | ID                                                |
| ------------------------------------------------- | ------------------------------------------------- |
| [智能聊天](https://top.aibase.com/discover/44-76) | [44-76](https://rsshub.app/aibase/discover/44-76) |
| [智能客服](https://top.aibase.com/discover/44-77) | [44-77](https://rsshub.app/aibase/discover/44-77) |

#### 翻译

| 分类                                          | ID                                                |
| --------------------------------------------- | ------------------------------------------------- |
| [翻译](https://top.aibase.com/discover/46-79) | [46-79](https://rsshub.app/aibase/discover/46-79) |

#### 教育学习

| 分类                                              | ID                                                |
| ------------------------------------------------- | ------------------------------------------------- |
| [教育学习](https://top.aibase.com/discover/47-80) | [47-80](https://rsshub.app/aibase/discover/47-80) |

#### 智能营销

| 分类                                              | ID                                                |
| ------------------------------------------------- | ------------------------------------------------- |
| [智能营销](https://top.aibase.com/discover/48-81) | [48-81](https://rsshub.app/aibase/discover/48-81) |

#### 法律

| 分类                                            | ID                                                    |
| ----------------------------------------------- | ----------------------------------------------------- |
| [法律](https://top.aibase.com/discover/138-139) | [138-139](https://rsshub.app/aibase/discover/138-139) |
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
            source: ['top.aibase.com/discover/:id'],
            target: (params) => {
                const id = params.id;

                return `/discover${id ? `/${id}` : ''}`;
            },
        },
        {
            title: '图像处理 - 图片背景移除',
            source: ['top.aibase.com/discover/37-49'],
            target: '/discover/37-49',
        },
        {
            title: '图像处理 - 图片无损放大',
            source: ['top.aibase.com/discover/37-50'],
            target: '/discover/37-50',
        },
        {
            title: '图像处理 - 图片AI修复',
            source: ['top.aibase.com/discover/37-51'],
            target: '/discover/37-51',
        },
        {
            title: '图像处理 - 图像生成',
            source: ['top.aibase.com/discover/37-52'],
            target: '/discover/37-52',
        },
        {
            title: '图像处理 - Ai图片拓展',
            source: ['top.aibase.com/discover/37-53'],
            target: '/discover/37-53',
        },
        {
            title: '图像处理 - Ai漫画生成',
            source: ['top.aibase.com/discover/37-54'],
            target: '/discover/37-54',
        },
        {
            title: '图像处理 - Ai生成写真',
            source: ['top.aibase.com/discover/37-55'],
            target: '/discover/37-55',
        },
        {
            title: '图像处理 - 电商图片制作',
            source: ['top.aibase.com/discover/37-83'],
            target: '/discover/37-83',
        },
        {
            title: '图像处理 - Ai图像转视频',
            source: ['top.aibase.com/discover/37-86'],
            target: '/discover/37-86',
        },
        {
            title: '视频创作 - 视频剪辑',
            source: ['top.aibase.com/discover/38-56'],
            target: '/discover/38-56',
        },
        {
            title: '视频创作 - 生成视频',
            source: ['top.aibase.com/discover/38-57'],
            target: '/discover/38-57',
        },
        {
            title: '视频创作 - Ai动画制作',
            source: ['top.aibase.com/discover/38-58'],
            target: '/discover/38-58',
        },
        {
            title: '视频创作 - 字幕生成',
            source: ['top.aibase.com/discover/38-84'],
            target: '/discover/38-84',
        },
        {
            title: '效率助手 - AI文档工具',
            source: ['top.aibase.com/discover/39-59'],
            target: '/discover/39-59',
        },
        {
            title: '效率助手 - PPT',
            source: ['top.aibase.com/discover/39-60'],
            target: '/discover/39-60',
        },
        {
            title: '效率助手 - 思维导图',
            source: ['top.aibase.com/discover/39-61'],
            target: '/discover/39-61',
        },
        {
            title: '效率助手 - 表格处理',
            source: ['top.aibase.com/discover/39-62'],
            target: '/discover/39-62',
        },
        {
            title: '效率助手 - Ai办公助手',
            source: ['top.aibase.com/discover/39-63'],
            target: '/discover/39-63',
        },
        {
            title: '写作灵感 - 文案写作',
            source: ['top.aibase.com/discover/40-64'],
            target: '/discover/40-64',
        },
        {
            title: '写作灵感 - 论文写作',
            source: ['top.aibase.com/discover/40-88'],
            target: '/discover/40-88',
        },
        {
            title: '艺术灵感 - 音乐创作',
            source: ['top.aibase.com/discover/41-65'],
            target: '/discover/41-65',
        },
        {
            title: '艺术灵感 - 设计创作',
            source: ['top.aibase.com/discover/41-66'],
            target: '/discover/41-66',
        },
        {
            title: '艺术灵感 - Ai图标生成',
            source: ['top.aibase.com/discover/41-67'],
            target: '/discover/41-67',
        },
        {
            title: '趣味 - Ai名字生成器',
            source: ['top.aibase.com/discover/42-68'],
            target: '/discover/42-68',
        },
        {
            title: '趣味 - 游戏娱乐',
            source: ['top.aibase.com/discover/42-71'],
            target: '/discover/42-71',
        },
        {
            title: '趣味 - 其他',
            source: ['top.aibase.com/discover/42-72'],
            target: '/discover/42-72',
        },
        {
            title: '开发编程 - 开发编程',
            source: ['top.aibase.com/discover/43-73'],
            target: '/discover/43-73',
        },
        {
            title: '开发编程 - Ai开放平台',
            source: ['top.aibase.com/discover/43-74'],
            target: '/discover/43-74',
        },
        {
            title: '开发编程 - Ai算力平台',
            source: ['top.aibase.com/discover/43-75'],
            target: '/discover/43-75',
        },
        {
            title: '聊天机器人 - 智能聊天',
            source: ['top.aibase.com/discover/44-76'],
            target: '/discover/44-76',
        },
        {
            title: '聊天机器人 - 智能客服',
            source: ['top.aibase.com/discover/44-77'],
            target: '/discover/44-77',
        },
        {
            title: '翻译 - 翻译',
            source: ['top.aibase.com/discover/46-79'],
            target: '/discover/46-79',
        },
        {
            title: '教育学习 - 教育学习',
            source: ['top.aibase.com/discover/47-80'],
            target: '/discover/47-80',
        },
        {
            title: '智能营销 - 智能营销',
            source: ['top.aibase.com/discover/48-81'],
            target: '/discover/48-81',
        },
        {
            title: '法律 - 法律',
            source: ['top.aibase.com/discover/138-139'],
            target: '/discover/138-139',
        },
    ],
};
