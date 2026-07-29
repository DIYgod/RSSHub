import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/pe/:id?',
    categories: ['university'],
    example: '/sspu/pe',
    parameters: { id: '栏目 id，见下表，默认为通知公告' },
    radar: [
        {
            source: ['pe2016.sspu.edu.cn/:id/list.htm'],
            target: '/pe/:id',
        },
    ],
    name: '体育部',
    maintainers: ['nczitzk'],
    handler,
    description: `| 通知公告 | 体育新闻 | 场馆管理 | 相关下载 |
| -------- | -------- | -------- | -------- |
| 342      | 343      | 324      | 325      |

<details>
  <summary>更多栏目</summary>

#### [部门概况](https://pe2016.sspu.edu.cn/318/list.htm)

| [部门简介](https://pe2016.sspu.edu.cn/327/list.htm) | [师资介绍](https://pe2016.sspu.edu.cn/328/list.htm) | [机构设置](https://pe2016.sspu.edu.cn/329/list.htm) | [团队建设](https://pe2016.sspu.edu.cn/330/list.htm) |
| --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| 327                                                 | 328                                                 | 329                                                 | 330                                                 |

#### [教育教学](https://pe2016.sspu.edu.cn/319/list.htm)

| [课程介绍](https://pe2016.sspu.edu.cn/331/list.htm) | [教学管理](https://pe2016.sspu.edu.cn/332/list.htm) | [教学成果](https://pe2016.sspu.edu.cn/333/list.htm) |
| --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| 331                                                 | 332                                                 | 333                                                 |

#### [学科研究](https://pe2016.sspu.edu.cn/320/list.htm)

| [学术交流](https://pe2016.sspu.edu.cn/334/list.htm) | [科研工作](https://pe2016.sspu.edu.cn/335/list.htm) |
| --------------------------------------------------- | --------------------------------------------------- |
| 334                                                 | 335                                                 |

#### [运动竞赛](https://pe2016.sspu.edu.cn/321/list.htm)

| [竞赛管理](https://pe2016.sspu.edu.cn/336/list.htm) | [竞赛成绩](https://pe2016.sspu.edu.cn/337/list.htm) | [特色项目](https://pe2016.sspu.edu.cn/338/list.htm) |
| --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| 336                                                 | 337                                                 | 338                                                 |

#### [群体活动](https://pe2016.sspu.edu.cn/322/list.htm)

| [阳光体育](https://pe2016.sspu.edu.cn/345/list.htm) | [体育社团](https://pe2016.sspu.edu.cn/346/list.htm) |
| --------------------------------------------------- | --------------------------------------------------- |
| 345                                                 | 346                                                 |

#### [党群工作](https://pe2016.sspu.edu.cn/323/list.htm)

| [党务公开](https://pe2016.sspu.edu.cn/339/list.htm) | [精神文明](https://pe2016.sspu.edu.cn/340/list.htm) | [教工之家](https://pe2016.sspu.edu.cn/341/list.htm) |
| --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| 339                                                 | 340                                                 | 341                                                 |

</details>`,
};

async function handler(ctx) {
    const { id = '342' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;

    const rootUrl = 'https://pe2016.sspu.edu.cn';
    const currentUrl = new URL(`${id}/list.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('table.wp_article_list_table a[title]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.prop('href'), rootUrl).href,
                pubDate: parseDate(item.prev().text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.link.endsWith('htm')) {
                    const { data: detailResponse } = await got(item.link);

                    const content = load(detailResponse);

                    const info = content('div.time').text();

                    item.title = content('div.title').text();
                    item.description = content('div.wp_articlecontent').html();
                    item.author = info.match(/来源：(.*?)\s/)?.[1] ?? undefined;
                    item.pubDate = info.match(/发布时间：(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s/)?.[1] ?? undefined;
                }

                return item;
            })
        )
    );

    const author = '上海第二工业大学';
    const subtitle = $('title').text();
    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: $('div.tyb_headtitle1').text(),
        language: $('html').prop('lang'),
        icon,
        logo: icon,
        subtitle,
        author,
    };
}
