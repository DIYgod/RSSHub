import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { category = 'sylm/xyxw' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 11;

    const domain = 'mse.hust.edu.cn';
    const rootUrl = `https://${domain}`;
    const currentUrl = new URL(`${category}.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('div.list ul li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');

            return {
                title: a.text(),
                pubDate: parseDate(item.find('span.time').text()),
                link: new URL(a.prop('href'), currentUrl).href,
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.includes(domain)) {
                    return item;
                }

                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h1.article_title').text() || $$('div.article_title').text() || item.title;
                const description = $$('div.v_news_content').html();

                for (const d of $$('div.article_data').contents().toArray()) {
                    const data = $$(d).text();

                    if (!item.pubDate && data.startsWith('发布')) {
                        const pubDate = data.split(/：/)?.pop();
                        item.pubDate = pubDate ? parseDate(pubDate) : item.pubDate;
                    } else if (!item.author && data.startsWith('作者')) {
                        item.author = data.split(/：/)?.pop() ?? undefined;
                    } else if (!item.author && data.startsWith('编辑')) {
                        item.author = data.split(/：/)?.pop() ?? undefined;
                    }
                }

                item.title = title;
                item.description = description;
                item.content = {
                    html: description,
                    text: $$('div.v_news_content').text(),
                };
                item.language = language;

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
        author: title.split(/-/)[0]?.trim(),
        language,
    };
};

export const route: Route = {
    path: '/mse/:category{.+}?',
    name: '机械科学与工程学院',
    url: 'mse.hust.edu.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/hust/mse/sylm/xyxw',
    parameters: { category: '分类，默认为 `sylm/xyxw`，即学院新闻，可在对应分类页 URL 中找到' },
    description: `::: tip
  若订阅 [通知公告](https://mse.hust.edu.cn/sylm/tzgg.htm)，网址为 \`https://mse.hust.edu.cn/sylm/tzgg.htm\`。截取 \`https://mse.hust.edu.cn/\` 到末尾 \`.html\` 的部分 \`sylm/tzgg\` 作为参数填入，此时路由为 [\`/hust/mse/sylm/tzgg\`](https://rsshub.app/hust/mse/sylm/tzgg)。
:::

#### [首页栏目](https://mse.hust.edu.cn/xyxw.htm)

| [学院新闻](https://mse.hust.edu.cn/xyxw.htm) | [通知公告](https://mse.hust.edu.cn/tzgg.htm) | [招生招聘](https://mse.hust.edu.cn/zszp.htm) | [媒体聚焦](https://mse.hust.edu.cn/mtjj.htm) |
| -------------------------------------------- | -------------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| [xyxw](https://rsshub.app/hust/mse/xyxw)     | [tzgg](https://rsshub.app/hust/mse/tzgg)     | [zszp](https://rsshub.app/hust/mse/zszp)     | [mtjj](https://rsshub.app/hust/mse/mtjj)     |

| [期刊动态](https://mse.hust.edu.cn/qkdt.htm) | [学术活动](https://mse.hust.edu.cn/xshd.htm) | [师生天地](https://mse.hust.edu.cn/sstd.htm) | [STAR风采](https://mse.hust.edu.cn/STARfc.htm) |
| -------------------------------------------- | -------------------------------------------- | -------------------------------------------- | ---------------------------------------------- |
| [qkdt](https://rsshub.app/hust/mse/qkdt)     | [xshd](https://rsshub.app/hust/mse/xshd)     | [sstd](https://rsshub.app/hust/mse/sstd)     | [STARfc](https://rsshub.app/hust/mse/STARfc)   |

<details>
<summary>更多分类</summary>

#### [理论学习](https://mse.hust.edu.cn/llxx1.htm)

| [党务动态](https://mse.hust.edu.cn/llxx1/dwdt/djxw.htm)        | [共青团](https://mse.hust.edu.cn/llxx1/gqt/xwdt.htm)         | [工会组织](https://mse.hust.edu.cn/llxx1/ghzz/xwgg.htm)        | [学习参考](https://mse.hust.edu.cn/llxx1/xxck.htm)   | [资料汇编](https://mse.hust.edu.cn/llxx1/zlhb.htm)   | [其他群团](https://mse.hust.edu.cn/llxx1/ghzz1/lmmc.htm)         |
| -------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| [llxx1/dwdt/djxw](https://rsshub.app/hust/mse/llxx1/dwdt/djxw) | [llxx1/gqt/xwdt](https://rsshub.app/hust/mse/llxx1/gqt/xwdt) | [llxx1/ghzz/xwgg](https://rsshub.app/hust/mse/llxx1/ghzz/xwgg) | [llxx1/xxck](https://rsshub.app/hust/mse/llxx1/xxck) | [llxx1/zlhb](https://rsshub.app/hust/mse/llxx1/zlhb) | [llxx1/ghzz1/lmmc](https://rsshub.app/hust/mse/llxx1/ghzz1/lmmc) |

#### [师资队伍](https://mse.hust.edu.cn/szdw/jsml/jsml/qb.htm)

| [人才招聘](https://mse.hust.edu.cn/szdw/rczp.htm)  | [常用下载](https://mse.hust.edu.cn/szdw/cyxz.htm)  |
| -------------------------------------------------- | -------------------------------------------------- |
| [szdw/rczp](https://rsshub.app/hust/mse/szdw/rczp) | [szdw/cyxz](https://rsshub.app/hust/mse/szdw/cyxz) |

#### [人才培养](https://mse.hust.edu.cn/rcpy.htm)

| [本科生教育](https://mse.hust.edu.cn/rcpy/bksjy.htm) | [研究生教育](https://mse.hust.edu.cn/rcpy/yjsjy.htm) | [学生工作](https://mse.hust.edu.cn/rcpy/xsg_z.htm)   | [机械创新基地](https://mse.hust.edu.cn/rcpy/jxcxjd.htm) | [常用下载](https://mse.hust.edu.cn/rcpy/cyxz.htm)  |
| ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------- |
| [rcpy/bksjy](https://rsshub.app/hust/mse/rcpy/bksjy) | [rcpy/yjsjy](https://rsshub.app/hust/mse/rcpy/yjsjy) | [rcpy/xsg_z](https://rsshub.app/hust/mse/rcpy/xsg_z) | [rcpy/jxcxjd](https://rsshub.app/hust/mse/rcpy/jxcxjd)  | [rcpy/cyxz](https://rsshub.app/hust/mse/rcpy/cyxz) |

#### [科学研究](https://mse.hust.edu.cn/kxyj.htm)

| [科研动态](https://mse.hust.edu.cn/kxyj/kydt.htm)  | [安全管理](https://mse.hust.edu.cn/kxyj/aqgl.htm)  | [设备开放](https://mse.hust.edu.cn/kxyj/sbkf.htm)  | [科研成果](https://mse.hust.edu.cn/kxyj/kycg.htm)  | [常用下载](https://mse.hust.edu.cn/kxyj/cyxz.htm)  |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| [kxyj/kydt](https://rsshub.app/hust/mse/kxyj/kydt) | [kxyj/aqgl](https://rsshub.app/hust/mse/kxyj/aqgl) | [kxyj/sbkf](https://rsshub.app/hust/mse/kxyj/sbkf) | [kxyj/kycg](https://rsshub.app/hust/mse/kxyj/kycg) | [kxyj/cyxz](https://rsshub.app/hust/mse/kxyj/cyxz) |

#### [社会服务](https://mse.hust.edu.cn/shfw.htm)

| [驻外研究院](https://mse.hust.edu.cn/shfw/zwyjy.htm) | [产业公司](https://mse.hust.edu.cn/shfw/cygs.htm)  |
| ---------------------------------------------------- | -------------------------------------------------- |
| [shfw/zwyjy](https://rsshub.app/hust/mse/shfw/zwyjy) | [shfw/cygs](https://rsshub.app/hust/mse/shfw/cygs) |

#### [合作交流](https://mse.hust.edu.cn/hzjl.htm)

| [专家来访](https://mse.hust.edu.cn/hzjl/zjlf.htm)  | [师生出访](https://mse.hust.edu.cn/hzjl/sscf.htm)  | [项目合作](https://mse.hust.edu.cn/hzjl/xmhz.htm)  | [国际会议](https://mse.hust.edu.cn/hzjl/gjhy.htm)  | [常用下载](https://mse.hust.edu.cn/hzjl/cyxz.htm)  |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| [hzjl/zjlf](https://rsshub.app/hust/mse/hzjl/zjlf) | [hzjl/sscf](https://rsshub.app/hust/mse/hzjl/sscf) | [hzjl/xmhz](https://rsshub.app/hust/mse/hzjl/xmhz) | [hzjl/gjhy](https://rsshub.app/hust/mse/hzjl/gjhy) | [hzjl/cyxz](https://rsshub.app/hust/mse/hzjl/cyxz) |

#### [校友专栏](https://mse.hust.edu.cn/xyzl.htm)

| [校友动态](https://mse.hust.edu.cn/xyzl/xydt.htm)  | [杰出校友](https://mse.hust.edu.cn/xyzl/jcxy.htm)  | [校友名录](https://mse.hust.edu.cn/xyzl/xyml.htm)  | [校友照片](https://mse.hust.edu.cn/xyzl/xyzp.htm)  | [服务校友](https://mse.hust.edu.cn/xyzl/fwxy.htm)  | [常用下载](https://mse.hust.edu.cn/xyzl/cyxz.htm)  |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| [xyzl/xydt](https://rsshub.app/hust/mse/xyzl/xydt) | [xyzl/jcxy](https://rsshub.app/hust/mse/xyzl/jcxy) | [xyzl/xyml](https://rsshub.app/hust/mse/xyzl/xyml) | [xyzl/xyzp](https://rsshub.app/hust/mse/xyzl/xyzp) | [xyzl/fwxy](https://rsshub.app/hust/mse/xyzl/fwxy) | [xyzl/cyxz](https://rsshub.app/hust/mse/xyzl/cyxz) |

#### [理论学习](https://mse.hust.edu.cn/sylm/xyxw.htm#)

| [党务动态](https://mse.hust.edu.cn/llxx1/dwdt/djxw.htm)        | [共青团](https://mse.hust.edu.cn/llxx1/gqt/xwdt.htm)         | [工会组织](https://mse.hust.edu.cn/llxx1/ghzz/xwgg.htm)        | [学习参考](https://mse.hust.edu.cn/llxx1/xxck.htm)   | [资料汇编](https://mse.hust.edu.cn/llxx1/zlhb.htm)   | [其他群团](https://mse.hust.edu.cn/llxx1/ghzz1/lmmc.htm)         |
| -------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| [llxx1/dwdt/djxw](https://rsshub.app/hust/mse/llxx1/dwdt/djxw) | [llxx1/gqt/xwdt](https://rsshub.app/hust/mse/llxx1/gqt/xwdt) | [llxx1/ghzz/xwgg](https://rsshub.app/hust/mse/llxx1/ghzz/xwgg) | [llxx1/xxck](https://rsshub.app/hust/mse/llxx1/xxck) | [llxx1/zlhb](https://rsshub.app/hust/mse/llxx1/zlhb) | [llxx1/ghzz1/lmmc](https://rsshub.app/hust/mse/llxx1/ghzz1/lmmc) |

#### [师资队伍](https://mse.hust.edu.cn/sylm/xyxw.htm#)

| [人才招聘](https://mse.hust.edu.cn/szdw/rczp.htm)  | [常用下载](https://mse.hust.edu.cn/szdw/cyxz.htm)  |
| -------------------------------------------------- | -------------------------------------------------- |
| [szdw/rczp](https://rsshub.app/hust/mse/szdw/rczp) | [szdw/cyxz](https://rsshub.app/hust/mse/szdw/cyxz) |

#### [人才培养](https://mse.hust.edu.cn/sylm/xyxw.htm#)

| [本科生教育](https://mse.hust.edu.cn/rcpy/bksjy.htm) | [研究生教育](https://mse.hust.edu.cn/rcpy/yjsjy.htm) | [学生工作](https://mse.hust.edu.cn/rcpy/xsg_z.htm)   | [机械创新基地](https://mse.hust.edu.cn/rcpy/jxcxjd.htm) | [常用下载](https://mse.hust.edu.cn/rcpy/cyxz.htm)  |
| ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------- |
| [rcpy/bksjy](https://rsshub.app/hust/mse/rcpy/bksjy) | [rcpy/yjsjy](https://rsshub.app/hust/mse/rcpy/yjsjy) | [rcpy/xsg_z](https://rsshub.app/hust/mse/rcpy/xsg_z) | [rcpy/jxcxjd](https://rsshub.app/hust/mse/rcpy/jxcxjd)  | [rcpy/cyxz](https://rsshub.app/hust/mse/rcpy/cyxz) |

#### [科学研究](https://mse.hust.edu.cn/sylm/xyxw.htm#)

| [科研动态](https://mse.hust.edu.cn/kxyj/kydt.htm)  | [安全管理](https://mse.hust.edu.cn/kxyj/aqgl.htm)  | [设备开放](https://mse.hust.edu.cn/kxyj/sbkf.htm)  | [科研成果](https://mse.hust.edu.cn/kxyj/kycg.htm)  | [常用下载](https://mse.hust.edu.cn/kxyj/cyxz.htm)  |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| [kxyj/kydt](https://rsshub.app/hust/mse/kxyj/kydt) | [kxyj/aqgl](https://rsshub.app/hust/mse/kxyj/aqgl) | [kxyj/sbkf](https://rsshub.app/hust/mse/kxyj/sbkf) | [kxyj/kycg](https://rsshub.app/hust/mse/kxyj/kycg) | [kxyj/cyxz](https://rsshub.app/hust/mse/kxyj/cyxz) |

#### [社会服务](https://mse.hust.edu.cn/sylm/xyxw.htm#)

| [驻外研究院](https://mse.hust.edu.cn/shfw/zwyjy.htm) | [产业公司](https://mse.hust.edu.cn/shfw/cygs.htm)  |
| ---------------------------------------------------- | -------------------------------------------------- |
| [shfw/zwyjy](https://rsshub.app/hust/mse/shfw/zwyjy) | [shfw/cygs](https://rsshub.app/hust/mse/shfw/cygs) |

#### [合作交流](https://mse.hust.edu.cn/sylm/xyxw.htm#)

| [专家来访](https://mse.hust.edu.cn/hzjl/zjlf.htm)  | [师生出访](https://mse.hust.edu.cn/hzjl/sscf.htm)  | [项目合作](https://mse.hust.edu.cn/hzjl/xmhz.htm)  | [国际会议](https://mse.hust.edu.cn/hzjl/gjhy.htm)  | [常用下载](https://mse.hust.edu.cn/hzjl/cyxz.htm)  |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| [hzjl/zjlf](https://rsshub.app/hust/mse/hzjl/zjlf) | [hzjl/sscf](https://rsshub.app/hust/mse/hzjl/sscf) | [hzjl/xmhz](https://rsshub.app/hust/mse/hzjl/xmhz) | [hzjl/gjhy](https://rsshub.app/hust/mse/hzjl/gjhy) | [hzjl/cyxz](https://rsshub.app/hust/mse/hzjl/cyxz) |

#### [校友专栏](https://mse.hust.edu.cn/sylm/xyxw.htm#)

| [校友动态](https://mse.hust.edu.cn/xyzl/xydt.htm)  | [杰出校友](https://mse.hust.edu.cn/xyzl/jcxy.htm)  | [校友名录](https://mse.hust.edu.cn/xyzl/xyml.htm)  | [校友照片](https://mse.hust.edu.cn/xyzl/xyzp.htm)  | [服务校友](https://mse.hust.edu.cn/xyzl/fwxy.htm)  | [常用下载](https://mse.hust.edu.cn/xyzl/cyxz.htm)  |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| [xyzl/xydt](https://rsshub.app/hust/mse/xyzl/xydt) | [xyzl/jcxy](https://rsshub.app/hust/mse/xyzl/jcxy) | [xyzl/xyml](https://rsshub.app/hust/mse/xyzl/xyml) | [xyzl/xyzp](https://rsshub.app/hust/mse/xyzl/xyzp) | [xyzl/fwxy](https://rsshub.app/hust/mse/xyzl/fwxy) | [xyzl/cyxz](https://rsshub.app/hust/mse/xyzl/cyxz) |

</details>
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
            source: ['mse.hust.edu.cn/:category?'],
            target: (params) => {
                const category = params.category;

                return `/hust/mse${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '首页栏目 - 学院新闻',
            source: ['mse.hust.edu.cn/xyxw.htm'],
            target: '/mse/xyxw',
        },
        {
            title: '首页栏目 - 通知公告',
            source: ['mse.hust.edu.cn/tzgg.htm'],
            target: '/mse/tzgg',
        },
        {
            title: '首页栏目 - 招生招聘',
            source: ['mse.hust.edu.cn/zszp.htm'],
            target: '/mse/zszp',
        },
        {
            title: '首页栏目 - 媒体聚焦',
            source: ['mse.hust.edu.cn/mtjj.htm'],
            target: '/mse/mtjj',
        },
        {
            title: '首页栏目 - 期刊动态',
            source: ['mse.hust.edu.cn/qkdt.htm'],
            target: '/mse/qkdt',
        },
        {
            title: '首页栏目 - 学术活动',
            source: ['mse.hust.edu.cn/xshd.htm'],
            target: '/mse/xshd',
        },
        {
            title: '首页栏目 - 师生天地',
            source: ['mse.hust.edu.cn/sstd.htm'],
            target: '/mse/sstd',
        },
        {
            title: '首页栏目 - STAR风采',
            source: ['mse.hust.edu.cn/STARfc.htm'],
            target: '/mse/STARfc',
        },
        {
            title: '理论学习 - 党务动态',
            source: ['mse.hust.edu.cn/llxx1/dwdt/djxw.htm'],
            target: '/mse/llxx1/dwdt/djxw',
        },
        {
            title: '理论学习 - 共青团',
            source: ['mse.hust.edu.cn/llxx1/gqt/xwdt.htm'],
            target: '/mse/llxx1/gqt/xwdt',
        },
        {
            title: '理论学习 - 工会组织',
            source: ['mse.hust.edu.cn/llxx1/ghzz/xwgg.htm'],
            target: '/mse/llxx1/ghzz/xwgg',
        },
        {
            title: '理论学习 - 学习参考',
            source: ['mse.hust.edu.cn/llxx1/xxck.htm'],
            target: '/mse/llxx1/xxck',
        },
        {
            title: '理论学习 - 资料汇编',
            source: ['mse.hust.edu.cn/llxx1/zlhb.htm'],
            target: '/mse/llxx1/zlhb',
        },
        {
            title: '理论学习 - 其他群团',
            source: ['mse.hust.edu.cn/llxx1/ghzz1/lmmc.htm'],
            target: '/mse/llxx1/ghzz1/lmmc',
        },
        {
            title: '师资队伍 - 人才招聘',
            source: ['mse.hust.edu.cn/szdw/rczp.htm'],
            target: '/mse/szdw/rczp',
        },
        {
            title: '师资队伍 - 常用下载',
            source: ['mse.hust.edu.cn/szdw/cyxz.htm'],
            target: '/mse/szdw/cyxz',
        },
        {
            title: '人才培养 - 本科生教育',
            source: ['mse.hust.edu.cn/rcpy/bksjy.htm'],
            target: '/mse/rcpy/bksjy',
        },
        {
            title: '人才培养 - 研究生教育',
            source: ['mse.hust.edu.cn/rcpy/yjsjy.htm'],
            target: '/mse/rcpy/yjsjy',
        },
        {
            title: '人才培养 - 学生工作',
            source: ['mse.hust.edu.cn/rcpy/xsg_z.htm'],
            target: '/mse/rcpy/xsg_z',
        },
        {
            title: '人才培养 - 机械创新基地',
            source: ['mse.hust.edu.cn/rcpy/jxcxjd.htm'],
            target: '/mse/rcpy/jxcxjd',
        },
        {
            title: '人才培养 - 常用下载',
            source: ['mse.hust.edu.cn/rcpy/cyxz.htm'],
            target: '/mse/rcpy/cyxz',
        },
        {
            title: '科学研究 - 科研动态',
            source: ['mse.hust.edu.cn/kxyj/kydt.htm'],
            target: '/mse/kxyj/kydt',
        },
        {
            title: '科学研究 - 安全管理',
            source: ['mse.hust.edu.cn/kxyj/aqgl.htm'],
            target: '/mse/kxyj/aqgl',
        },
        {
            title: '科学研究 - 设备开放',
            source: ['mse.hust.edu.cn/kxyj/sbkf.htm'],
            target: '/mse/kxyj/sbkf',
        },
        {
            title: '科学研究 - 科研成果',
            source: ['mse.hust.edu.cn/kxyj/kycg.htm'],
            target: '/mse/kxyj/kycg',
        },
        {
            title: '科学研究 - 常用下载',
            source: ['mse.hust.edu.cn/kxyj/cyxz.htm'],
            target: '/mse/kxyj/cyxz',
        },
        {
            title: '社会服务 - 驻外研究院',
            source: ['mse.hust.edu.cn/shfw/zwyjy.htm'],
            target: '/mse/shfw/zwyjy',
        },
        {
            title: '社会服务 - 产业公司',
            source: ['mse.hust.edu.cn/shfw/cygs.htm'],
            target: '/mse/shfw/cygs',
        },
        {
            title: '合作交流 - 专家来访',
            source: ['mse.hust.edu.cn/hzjl/zjlf.htm'],
            target: '/mse/hzjl/zjlf',
        },
        {
            title: '合作交流 - 师生出访',
            source: ['mse.hust.edu.cn/hzjl/sscf.htm'],
            target: '/mse/hzjl/sscf',
        },
        {
            title: '合作交流 - 项目合作',
            source: ['mse.hust.edu.cn/hzjl/xmhz.htm'],
            target: '/mse/hzjl/xmhz',
        },
        {
            title: '合作交流 - 国际会议',
            source: ['mse.hust.edu.cn/hzjl/gjhy.htm'],
            target: '/mse/hzjl/gjhy',
        },
        {
            title: '合作交流 - 常用下载',
            source: ['mse.hust.edu.cn/hzjl/cyxz.htm'],
            target: '/mse/hzjl/cyxz',
        },
        {
            title: '校友专栏 - 校友动态',
            source: ['mse.hust.edu.cn/xyzl/xydt.htm'],
            target: '/mse/xyzl/xydt',
        },
        {
            title: '校友专栏 - 杰出校友',
            source: ['mse.hust.edu.cn/xyzl/jcxy.htm'],
            target: '/mse/xyzl/jcxy',
        },
        {
            title: '校友专栏 - 校友名录',
            source: ['mse.hust.edu.cn/xyzl/xyml.htm'],
            target: '/mse/xyzl/xyml',
        },
        {
            title: '校友专栏 - 校友照片',
            source: ['mse.hust.edu.cn/xyzl/xyzp.htm'],
            target: '/mse/xyzl/xyzp',
        },
        {
            title: '校友专栏 - 服务校友',
            source: ['mse.hust.edu.cn/xyzl/fwxy.htm'],
            target: '/mse/xyzl/fwxy',
        },
        {
            title: '校友专栏 - 常用下载',
            source: ['mse.hust.edu.cn/xyzl/cyxz.htm'],
            target: '/mse/xyzl/cyxz',
        },
        {
            title: '理论学习 - 党务动态',
            source: ['mse.hust.edu.cn/llxx1/dwdt/djxw.htm'],
            target: '/mse/llxx1/dwdt/djxw',
        },
        {
            title: '理论学习 - 共青团',
            source: ['mse.hust.edu.cn/llxx1/gqt/xwdt.htm'],
            target: '/mse/llxx1/gqt/xwdt',
        },
        {
            title: '理论学习 - 工会组织',
            source: ['mse.hust.edu.cn/llxx1/ghzz/xwgg.htm'],
            target: '/mse/llxx1/ghzz/xwgg',
        },
        {
            title: '理论学习 - 学习参考',
            source: ['mse.hust.edu.cn/llxx1/xxck.htm'],
            target: '/mse/llxx1/xxck',
        },
        {
            title: '理论学习 - 资料汇编',
            source: ['mse.hust.edu.cn/llxx1/zlhb.htm'],
            target: '/mse/llxx1/zlhb',
        },
        {
            title: '理论学习 - 其他群团',
            source: ['mse.hust.edu.cn/llxx1/ghzz1/lmmc.htm'],
            target: '/mse/llxx1/ghzz1/lmmc',
        },
        {
            title: '师资队伍 - 人才招聘',
            source: ['mse.hust.edu.cn/szdw/rczp.htm'],
            target: '/mse/szdw/rczp',
        },
        {
            title: '师资队伍 - 常用下载',
            source: ['mse.hust.edu.cn/szdw/cyxz.htm'],
            target: '/mse/szdw/cyxz',
        },
        {
            title: '人才培养 - 本科生教育',
            source: ['mse.hust.edu.cn/rcpy/bksjy.htm'],
            target: '/mse/rcpy/bksjy',
        },
        {
            title: '人才培养 - 研究生教育',
            source: ['mse.hust.edu.cn/rcpy/yjsjy.htm'],
            target: '/mse/rcpy/yjsjy',
        },
        {
            title: '人才培养 - 学生工作',
            source: ['mse.hust.edu.cn/rcpy/xsg_z.htm'],
            target: '/mse/rcpy/xsg_z',
        },
        {
            title: '人才培养 - 机械创新基地',
            source: ['mse.hust.edu.cn/rcpy/jxcxjd.htm'],
            target: '/mse/rcpy/jxcxjd',
        },
        {
            title: '人才培养 - 常用下载',
            source: ['mse.hust.edu.cn/rcpy/cyxz.htm'],
            target: '/mse/rcpy/cyxz',
        },
        {
            title: '科学研究 - 科研动态',
            source: ['mse.hust.edu.cn/kxyj/kydt.htm'],
            target: '/mse/kxyj/kydt',
        },
        {
            title: '科学研究 - 安全管理',
            source: ['mse.hust.edu.cn/kxyj/aqgl.htm'],
            target: '/mse/kxyj/aqgl',
        },
        {
            title: '科学研究 - 设备开放',
            source: ['mse.hust.edu.cn/kxyj/sbkf.htm'],
            target: '/mse/kxyj/sbkf',
        },
        {
            title: '科学研究 - 科研成果',
            source: ['mse.hust.edu.cn/kxyj/kycg.htm'],
            target: '/mse/kxyj/kycg',
        },
        {
            title: '科学研究 - 常用下载',
            source: ['mse.hust.edu.cn/kxyj/cyxz.htm'],
            target: '/mse/kxyj/cyxz',
        },
        {
            title: '社会服务 - 驻外研究院',
            source: ['mse.hust.edu.cn/shfw/zwyjy.htm'],
            target: '/mse/shfw/zwyjy',
        },
        {
            title: '社会服务 - 产业公司',
            source: ['mse.hust.edu.cn/shfw/cygs.htm'],
            target: '/mse/shfw/cygs',
        },
        {
            title: '合作交流 - 专家来访',
            source: ['mse.hust.edu.cn/hzjl/zjlf.htm'],
            target: '/mse/hzjl/zjlf',
        },
        {
            title: '合作交流 - 师生出访',
            source: ['mse.hust.edu.cn/hzjl/sscf.htm'],
            target: '/mse/hzjl/sscf',
        },
        {
            title: '合作交流 - 项目合作',
            source: ['mse.hust.edu.cn/hzjl/xmhz.htm'],
            target: '/mse/hzjl/xmhz',
        },
        {
            title: '合作交流 - 国际会议',
            source: ['mse.hust.edu.cn/hzjl/gjhy.htm'],
            target: '/mse/hzjl/gjhy',
        },
        {
            title: '合作交流 - 常用下载',
            source: ['mse.hust.edu.cn/hzjl/cyxz.htm'],
            target: '/mse/hzjl/cyxz',
        },
        {
            title: '校友专栏 - 校友动态',
            source: ['mse.hust.edu.cn/xyzl/xydt.htm'],
            target: '/mse/xyzl/xydt',
        },
        {
            title: '校友专栏 - 杰出校友',
            source: ['mse.hust.edu.cn/xyzl/jcxy.htm'],
            target: '/mse/xyzl/jcxy',
        },
        {
            title: '校友专栏 - 校友名录',
            source: ['mse.hust.edu.cn/xyzl/xyml.htm'],
            target: '/mse/xyzl/xyml',
        },
        {
            title: '校友专栏 - 校友照片',
            source: ['mse.hust.edu.cn/xyzl/xyzp.htm'],
            target: '/mse/xyzl/xyzp',
        },
        {
            title: '校友专栏 - 服务校友',
            source: ['mse.hust.edu.cn/xyzl/fwxy.htm'],
            target: '/mse/xyzl/fwxy',
        },
        {
            title: '校友专栏 - 常用下载',
            source: ['mse.hust.edu.cn/xyzl/cyxz.htm'],
            target: '/mse/xyzl/cyxz',
        },
    ],
};
