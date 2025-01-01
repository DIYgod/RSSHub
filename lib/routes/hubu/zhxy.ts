import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { category = 'index/tzgg' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'https://zhxy.hubu.edu.cn';
    const currentUrl = new URL(`${category}.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('div.box h1 a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.contents().first().text(),
                pubDate: parseDate(item.find('span').text().replaceAll('[]', '')),
                link: new URL(item.prop('href'), currentUrl).href,
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link);

                    const $$ = load(detailResponse);

                    const title = $$('div.ar_title h1').text();

                    if (!title) {
                        return item;
                    }

                    const description = $$('div.v_news_content').html();

                    item.title = title;
                    item.description = description;
                    item.category = $$('META[Name="keywords"]')
                        .toArray()
                        .map((c) => $$(c).text());
                    item.content = {
                        html: description,
                        text: $$('div.v_news_content').text(),
                    };
                    item.language = language;
                } catch {
                    // no-empty
                }

                return item;
            })
        )
    );

    const title = $('title').text();
    const image = new URL($('div.logo a img').prop('src'), currentUrl).href;

    return {
        title,
        description: $('META[Name="keywords"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: title.split(/-/).pop(),
        language,
    };
};

export const route: Route = {
    path: '/zhxy/:category{.+}?',
    name: '资源环境学院',
    url: 'zhxy.hubu.edu.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/hubu/zhxy/index/tzgg',
    parameters: { category: '分类，可在对应分类页 URL 中找到，默认为[通知公告](https://zhxy.hubu.edu.cn/index/tzgg.htm)' },
    description: `::: tip
  若订阅 [通知公告](https://zhxy.hubu.edu.cn/index/tzgg.htm)，网址为 \`https://zhxy.hubu.edu.cn/index/tzgg.htm\`。截取 \`https://zhxy.hubu.edu.cn/\` 到末尾 \`.htm\` 的部分 \`index/tzgg\` 作为参数填入，此时路由为 [\`/hubu/zhxy/index/tzgg\`](https://rsshub.app/hubu/zhxy/index/tzgg)。
:::

  | [通知公告](https://zhxy.hubu.edu.cn/index/tzgg.htm) | [新闻动态](https://zhxy.hubu.edu.cn/index/xwdt.htm) |
  | --------------------------------------------------- | --------------------------------------------------- |
  | index/tzgg                                          | index/xwdt                                          |  

  #### [人才培养](https://zhxy.hubu.edu.cn/rcpy.htm)
  
  | [人才培养](https://zhxy.hubu.edu.cn/rcpy.htm) | [本科生教育](https://zhxy.hubu.edu.cn/rcpy/bksjy.htm) | [研究生教育](https://zhxy.hubu.edu.cn/rcpy/yjsjy.htm) | [招生与就业](https://zhxy.hubu.edu.cn/rcpy/zsyjy/zsxx.htm) |
  | --------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------- |
  | rcpy                                          | rcpy/bksjy                                            | rcpy/yjsjy                                            | rcpy/zsyjy/zsxx                                            |
  
  #### [学科建设](https://zhxy.hubu.edu.cn/xkjianshe/zdxk.htm)
  
  | [学科建设](https://zhxy.hubu.edu.cn/xkjianshe/zdxk.htm) | [重点学科](https://zhxy.hubu.edu.cn/xkjianshe/zdxk.htm) | [硕士点](https://zhxy.hubu.edu.cn/xkjianshe/ssd.htm) | [博士点](https://zhxy.hubu.edu.cn/xkjianshe/bsd.htm) |
  | ------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
  | xkjianshe/zdxk                                          | xkjianshe/zdxk                                          | xkjianshe/ssd                                        | xkjianshe/bsd                                        |
  
  #### [科研服务](https://zhxy.hubu.edu.cn/kyfw.htm)
  
  | [科研服务](https://zhxy.hubu.edu.cn/kyfw.htm) | [科研动态](https://zhxy.hubu.edu.cn/kyfw/kydongt.htm) | [学术交流](https://zhxy.hubu.edu.cn/kyfw/xsjl.htm) | [科研平台](https://zhxy.hubu.edu.cn/kyfw/keyapt.htm) | [社会服务](https://zhxy.hubu.edu.cn/kyfw/shfuw.htm) |
  | --------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------- |
  | kyfw                                          | kyfw/kydongt                                          | kyfw/xsjl                                          | kyfw/keyapt                                          | kyfw/shfuw                                          |
  
  #### [党群工作](https://zhxy.hubu.edu.cn/dqgz.htm)
  
  | [党群工作](https://zhxy.hubu.edu.cn/dqgz.htm) | [党建工作](https://zhxy.hubu.edu.cn/dqgz/djgz/jgdj.htm) | [工会工作](https://zhxy.hubu.edu.cn/dqgz/ghgon.htm) |
  | --------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------- |
  | dqgz                                          | dqgz/djgz/jgdj                                          | dqgz/ghgon                                          |
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
            title: '通知公告',
            source: ['zhxy.hubu.edu.cn/index/tzgg.htm'],
            target: '/zhxy/index/tzgg',
        },
        {
            title: '新闻动态',
            source: ['zhxy.hubu.edu.cn/index/xwdt.htm'],
            target: '/zhxy/index/xwdt',
        },
        {
            title: '人才培养',
            source: ['zhxy.hubu.edu.cn/rcpy.htm'],
            target: '/zhxy/rcpy',
        },
        {
            title: '人才培养 - 本科生教育',
            source: ['zhxy.hubu.edu.cn/rcpy/bksjy.htm'],
            target: '/zhxy/rcpy/bksjy',
        },
        {
            title: '人才培养 - 研究生教育',
            source: ['zhxy.hubu.edu.cn/rcpy/yjsjy.htm'],
            target: '/zhxy/rcpy/yjsjy',
        },
        {
            title: '人才培养 - 招生与就业',
            source: ['zhxy.hubu.edu.cn/rcpy/zsyjy/zsxx.htm'],
            target: '/zhxy/rcpy/zsyjy/zsxx',
        },
        {
            title: '学科建设',
            source: ['zhxy.hubu.edu.cn/xkjianshe/zdxk.htm'],
            target: '/zhxy/xkjianshe/zdxk',
        },
        {
            title: '学科建设 - 重点学科',
            source: ['zhxy.hubu.edu.cn/xkjianshe/zdxk.htm'],
            target: '/zhxy/xkjianshe/zdxk',
        },
        {
            title: '学科建设 - 硕士点',
            source: ['zhxy.hubu.edu.cn/xkjianshe/ssd.htm'],
            target: '/zhxy/xkjianshe/ssd',
        },
        {
            title: '学科建设 - 博士点',
            source: ['zhxy.hubu.edu.cn/xkjianshe/bsd.htm'],
            target: '/zhxy/xkjianshe/bsd',
        },
        {
            title: '科研服务',
            source: ['zhxy.hubu.edu.cn/kyfw.htm'],
            target: '/zhxy/kyfw',
        },
        {
            title: '科研服务 - 科研动态',
            source: ['zhxy.hubu.edu.cn/kyfw/kydongt.htm'],
            target: '/zhxy/kyfw/kydongt',
        },
        {
            title: '科研服务 - 学术交流',
            source: ['zhxy.hubu.edu.cn/kyfw/xsjl.htm'],
            target: '/zhxy/kyfw/xsjl',
        },
        {
            title: '科研服务 - 科研平台',
            source: ['zhxy.hubu.edu.cn/kyfw/keyapt.htm'],
            target: '/zhxy/kyfw/keyapt',
        },
        {
            title: '科研服务 - 社会服务',
            source: ['zhxy.hubu.edu.cn/kyfw/shfuw.htm'],
            target: '/zhxy/kyfw/shfuw',
        },
        {
            title: '党群工作',
            source: ['zhxy.hubu.edu.cn/dqgz.htm'],
            target: '/zhxy/dqgz',
        },
        {
            title: '党群工作 - 党建工作',
            source: ['zhxy.hubu.edu.cn/dqgz/djgz/jgdj.htm'],
            target: '/zhxy/dqgz/djgz/jgdj',
        },
        {
            title: '党群工作 - 工会工作',
            source: ['zhxy.hubu.edu.cn/dqgz/ghgon.htm'],
            target: '/zhxy/dqgz/ghgon',
        },
    ],
};
