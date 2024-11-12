import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { category = 'xwdt' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 16;

    const rootUrl = 'https://gs.hust.edu.cn';
    const currentUrl = new URL(`${category}.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.btlist ul li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');
            const link = a.prop('href');

            return {
                title: a.text(),
                pubDate: parseDate(item.find('span.time').text()),
                link: link.startsWith('http') ? link : new URL(link, rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link);

                    const $$ = load(detailResponse);

                    const description = $$('div.v_news_content').html();

                    item.title = $$('div.article_title h1, h5').text();
                    item.description = description;
                    item.content = {
                        html: description,
                        text: $$('div.v_news_content').text(),
                    };
                } catch {
                    // no-empty
                }

                return item;
            })
        )
    );

    const title = $('meta[name="keywords"]').prop('content')?.replace(/,/g, ' - ') ?? $('title').text();
    const image = new URL($('div.logo img').prop('src'), rootUrl).href;

    return {
        title,
        description: title.split(/-/).pop()?.trim(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
    };
};

export const route: Route = {
    path: '/gs/:category{.+}?',
    name: '研究生院',
    url: 'gs.hust.edu.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/hust/gs/xwdt',
    parameters: { category: '分类，默认为新闻动态，即 `xwdt`，可在对应分类页 URL 中找到' },
    description: `:::tip
  若订阅 [新闻动态](https://gs.hust.edu.cn/xwdt.htm)，网址为 \`https://gs.hust.edu.cn/xwdt.htm\`。截取 \`https://gs.hust.edu.cn/\` 到末尾 \`.htm\` 的部分 \`xwdt\` 作为参数填入，此时路由为 [\`/hust/gs/xwdt\`](https://rsshub.app/hust/gs/xwdt)。
  :::

  | [新闻动态](https://gs.hust.edu.cn/xwdt.htm) | [研究生服务专区](https://gs.hust.edu.cn/yjsfwzq.htm) | [综合管理](https://gs.hust.edu.cn/gzzd/zhgl.htm)  |
  | ------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------- |
  | [xwdt](https://rsshub.app/hust/gs/xwdt)     | [yjsfwzq](https://rsshub.app/hust/gs/yjsfwzq)        | [gzzd/zhgl](https://rsshub.app/hust/gs/gzzd/zhgl) |

  #### [通知公告](https://gs.hust.edu.cn/tzgg/kcjksap.htm)

  | [课程及考试安排](https://gs.hust.edu.cn/tzgg/kcjksap.htm) | [国际交流](https://gs.hust.edu.cn/tzgg/gjjl.htm)  | [学位工作](https://gs.hust.edu.cn/tzgg/xwgz.htm)  | [同济医学院](https://gs.hust.edu.cn/tzgg/tjyxy.htm) | [其他](https://gs.hust.edu.cn/tzgg/qt.htm)    |
  | --------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------- | --------------------------------------------- |
  | [tzgg/kcjksap](https://rsshub.app/hust/gs/tzgg/kcjksap)   | [tzgg/gjjl](https://rsshub.app/hust/gs/tzgg/gjjl) | [tzgg/xwgz](https://rsshub.app/hust/gs/tzgg/xwgz) | [tzgg/tjyxy](https://rsshub.app/hust/gs/tzgg/tjyxy) | [tzgg/qt](https://rsshub.app/hust/gs/tzgg/qt) |

  #### [学籍管理](https://gs.hust.edu.cn/pygz/zbjs1/xjyd.htm)

  | [学籍异动](https://gs.hust.edu.cn/pygz/zbjs1/xjyd.htm)        | [毕业管理](https://gs.hust.edu.cn/pygz/zbjs1/bygl.htm)        |
  | ------------------------------------------------------------- | ------------------------------------------------------------- |
  | [pygz/zbjs1/xjyd](https://rsshub.app/hust/gs/pygz/zbjs1/xjyd) | [pygz/zbjs1/bygl](https://rsshub.app/hust/gs/pygz/zbjs1/bygl) |

  #### [教学管理](https://gs.hust.edu.cn/pygz/zbjs13/jxyj.htm)

  | [教学研究](https://gs.hust.edu.cn/pygz/zbjs13/jxyj.htm)         | [课程教材](https://gs.hust.edu.cn/pygz/zbjs13/kcjc.htm)         | [教学安排](https://gs.hust.edu.cn/pygz/zbjs13/jxap.htm)         | [课表查询](https://gs.hust.edu.cn/pygz/zbjs13/kbcx.htm)         |
  | --------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- |
  | [pygz/zbjs13/jxyj](https://rsshub.app/hust/gs/pygz/zbjs13/jxyj) | [pygz/zbjs13/kcjc](https://rsshub.app/hust/gs/pygz/zbjs13/kcjc) | [pygz/zbjs13/jxap](https://rsshub.app/hust/gs/pygz/zbjs13/jxap) | [pygz/zbjs13/kbcx](https://rsshub.app/hust/gs/pygz/zbjs13/kbcx) |

  #### [培养过程](https://gs.hust.edu.cn/pygz/pygc.htm)

  | [培养方案](https://gs.hust.edu.cn/pygz/pygc/pyfa.htm)       | [硕博连读](https://gs.hust.edu.cn/pygz/pygc/sbld.htm)       |
  | ----------------------------------------------------------- | ----------------------------------------------------------- |
  | [pygz/pygc/pyfa](https://rsshub.app/hust/gs/pygz/pygc/pyfa) | [pygz/pygc/sbld](https://rsshub.app/hust/gs/pygz/pygc/sbld) |

  #### [国际交流](https://gs.hust.edu.cn/pygz/zbjs11/gjgpxm.htm)

  | [国家公派项目](https://gs.hust.edu.cn/pygz/zbjs11/gjgpxm.htm)       | [国际学术会议](https://gs.hust.edu.cn/pygz/zbjs11/gjxshy.htm)       | [校际合作项目](https://gs.hust.edu.cn/pygz/zbjs11/xjhzxm.htm)       | [国际交流与合作办事流程](https://gs.hust.edu.cn/pygz/zbjs11/gjjlyhzbslc.htm)  |
  | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
  | [pygz/zbjs11/gjgpxm](https://rsshub.app/hust/gs/pygz/zbjs11/gjgpxm) | [pygz/zbjs11/gjxshy](https://rsshub.app/hust/gs/pygz/zbjs11/gjxshy) | [pygz/zbjs11/xjhzxm](https://rsshub.app/hust/gs/pygz/zbjs11/xjhzxm) | [pygz/zbjs11/gjjlyhzbslc](https://rsshub.app/hust/gs/pygz/zbjs11/gjjlyhzbslc) |

  #### [专业学位](https://gs.hust.edu.cn/pygz/zbjs111/xwsqdml.htm)

  | [学位授权点目录](https://gs.hust.edu.cn/pygz/zbjs111/xwsqdml.htm)       | [专业学位建设](https://gs.hust.edu.cn/pygz/zbjs111/zyxwjs.htm)        | [特色培养](https://gs.hust.edu.cn/pygz/zbjs111/tspy.htm)          |
  | ----------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
  | [pygz/zbjs111/xwsqdml](https://rsshub.app/hust/gs/pygz/zbjs111/xwsqdml) | [pygz/zbjs111/zyxwjs](https://rsshub.app/hust/gs/pygz/zbjs111/zyxwjs) | [pygz/zbjs111/tspy](https://rsshub.app/hust/gs/pygz/zbjs111/tspy) |

  #### [学位工作](https://gs.hust.edu.cn/xwgz/xwdjs.htm)

  | [学位点建设](https://gs.hust.edu.cn/xwgz/xwdjs.htm) | [学位授予](https://gs.hust.edu.cn/xwgz/xwsy.htm)  | [导师队伍](https://gs.hust.edu.cn/xwgz/dsdw.htm)  |
  | --------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
  | [xwgz/xwdjs](https://rsshub.app/hust/gs/xwgz/xwdjs) | [xwgz/xwsy](https://rsshub.app/hust/gs/xwgz/xwsy) | [xwgz/dsdw](https://rsshub.app/hust/gs/xwgz/dsdw) |
  `,
    categories: ['university'],

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
            source: ['gs.hust.edu.cn/:category'],
            target: (params) => {
                const category = params.category;

                return `/hust/gs${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '新闻动态',
            source: ['gs.hust.edu.cn/xwdt.htm'],
            target: '/gs/xwdt',
        },
        {
            title: '研究生服务专区',
            source: ['gs.hust.edu.cn/yjsfwzq.htm'],
            target: '/gs/yjsfwzq',
        },
        {
            title: '综合管理',
            source: ['gs.hust.edu.cn/gzzd/zhgl.htm'],
            target: '/gs/gzzd/zhgl',
        },
        {
            title: '通知公告 - 课程及考试安排',
            source: ['gs.hust.edu.cn/tzgg/kcjksap.htm'],
            target: '/gs/tzgg/kcjksap',
        },
        {
            title: '通知公告 - 国际交流',
            source: ['gs.hust.edu.cn/tzgg/gjjl.htm'],
            target: '/gs/tzgg/gjjl',
        },
        {
            title: '通知公告 - 学位工作',
            source: ['gs.hust.edu.cn/tzgg/xwgz.htm'],
            target: '/gs/tzgg/xwgz',
        },
        {
            title: '通知公告 - 同济医学院',
            source: ['gs.hust.edu.cn/tzgg/tjyxy.htm'],
            target: '/gs/tzgg/tjyxy',
        },
        {
            title: '通知公告 - 其他',
            source: ['gs.hust.edu.cn/tzgg/qt.htm'],
            target: '/gs/tzgg/qt',
        },
        {
            title: '学籍管理 - 学籍异动',
            source: ['gs.hust.edu.cn/pygz/zbjs1/xjyd.htm'],
            target: '/gs/pygz/zbjs1/xjyd',
        },
        {
            title: '学籍管理 - 毕业管理',
            source: ['gs.hust.edu.cn/pygz/zbjs1/bygl.htm'],
            target: '/gs/pygz/zbjs1/bygl',
        },
        {
            title: '教学管理 - 教学研究',
            source: ['gs.hust.edu.cn/pygz/zbjs13/jxyj.htm'],
            target: '/gs/pygz/zbjs13/jxyj',
        },
        {
            title: '教学管理 - 课程教材',
            source: ['gs.hust.edu.cn/pygz/zbjs13/kcjc.htm'],
            target: '/gs/pygz/zbjs13/kcjc',
        },
        {
            title: '教学管理 - 教学安排',
            source: ['gs.hust.edu.cn/pygz/zbjs13/jxap.htm'],
            target: '/gs/pygz/zbjs13/jxap',
        },
        {
            title: '教学管理 - 课表查询',
            source: ['gs.hust.edu.cn/pygz/zbjs13/kbcx.htm'],
            target: '/gs/pygz/zbjs13/kbcx',
        },
        {
            title: '培养过程 - 培养方案',
            source: ['gs.hust.edu.cn/pygz/pygc/pyfa.htm'],
            target: '/gs/pygz/pygc/pyfa',
        },
        {
            title: '培养过程 - 硕博连读',
            source: ['gs.hust.edu.cn/pygz/pygc/sbld.htm'],
            target: '/gs/pygz/pygc/sbld',
        },
        {
            title: '国际交流 - 国家公派项目',
            source: ['gs.hust.edu.cn/pygz/zbjs11/gjgpxm.htm'],
            target: '/gs/pygz/zbjs11/gjgpxm',
        },
        {
            title: '国际交流 - 国际学术会议',
            source: ['gs.hust.edu.cn/pygz/zbjs11/gjxshy.htm'],
            target: '/gs/pygz/zbjs11/gjxshy',
        },
        {
            title: '国际交流 - 校际合作项目',
            source: ['gs.hust.edu.cn/pygz/zbjs11/xjhzxm.htm'],
            target: '/gs/pygz/zbjs11/xjhzxm',
        },
        {
            title: '国际交流 - 国际交流与合作办事流程',
            source: ['gs.hust.edu.cn/pygz/zbjs11/gjjlyhzbslc.htm'],
            target: '/gs/pygz/zbjs11/gjjlyhzbslc',
        },
        {
            title: '专业学位 - 学位授权点目录',
            source: ['gs.hust.edu.cn/pygz/zbjs111/xwsqdml.htm'],
            target: '/gs/pygz/zbjs111/xwsqdml',
        },
        {
            title: '专业学位 - 专业学位建设',
            source: ['gs.hust.edu.cn/pygz/zbjs111/zyxwjs.htm'],
            target: '/gs/pygz/zbjs111/zyxwjs',
        },
        {
            title: '专业学位 - 特色培养',
            source: ['gs.hust.edu.cn/pygz/zbjs111/tspy.htm'],
            target: '/gs/pygz/zbjs111/tspy',
        },
        {
            title: '学位工作 - 学位点建设',
            source: ['gs.hust.edu.cn/xwgz/xwdjs.htm'],
            target: '/gs/xwgz/xwdjs',
        },
        {
            title: '学位工作 - 学位授予',
            source: ['gs.hust.edu.cn/xwgz/xwsy.htm'],
            target: '/gs/xwgz/xwsy',
        },
        {
            title: '学位工作 - 导师队伍',
            source: ['gs.hust.edu.cn/xwgz/dsdw.htm'],
            target: '/gs/xwgz/dsdw',
        },
    ],
};
