import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage, type Page } from '@/utils/playwright';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const rootUrl = 'https://zhxy.hubu.edu.cn';
const allowedResourceTypes = new Set(['document', 'xhr', 'fetch']);

function isHttp2ProtocolError(error: unknown): error is Error {
    return error instanceof Error && (error.message.includes('NGHTTP2_PROTOCOL_ERROR') || isHttp2ProtocolError(error.cause));
}

async function fetchHtml(url: string, page?: Page): Promise<string> {
    if (!page) {
        const { data } = await got(url);
        return data;
    }
    return await page.evaluate(async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HUBU resource and environment college returned HTTP ${response.status}.`);
        }
        return await response.text();
    }, url);
}

export const handler = async (ctx) => {
    try {
        return await fetchFeed(ctx);
    } catch (error) {
        if (!(error instanceof FetchError) || !isHttp2ProtocolError(error)) {
            throw error;
        }
    }
    const { category = 'index/tzgg' } = ctx.req.param();
    const url = `${rootUrl}/${category}.htm`;
    const { page, destroy } = await getPlaywrightPage(url, { noGoto: true, closeTimeout: 0 });
    try {
        await page.route('**/*', (route) => (allowedResourceTypes.has(route.request().resourceType()) ? route.continue() : route.abort()));
        const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
        if (!response?.ok() || new URL(page.url()).origin !== rootUrl) {
            throw new Error('HUBU resource and environment college did not provide its public website.');
        }
        return await fetchFeed(ctx, page);
    } finally {
        await destroy();
    }
};

const fetchFeed = async (ctx, page?: Page) => {
    const { category = 'index/tzgg' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 20);

    const currentUrl = `${rootUrl}/${category}.htm`;

    const response = await fetchHtml(currentUrl, page);

    const $ = load(response);

    const language = $('html').prop('lang') as Language;

    let items = $('div.box h1 a')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const dateText = $item.find('span').text().replaceAll(/[[\]]/g, '').trim();
            const calendarDate = /^\d{4}-\d{2}-\d{2}$/.test(dateText);
            const date = dateText ? parseDate(dateText, calendarDate ? 'YYYY-MM-DD' : undefined, true) : undefined;

            return {
                title: $item.contents().first().text(),
                pubDate: date && Number.isFinite(date.getTime()) ? (calendarDate ? timezone(date, 8) : date) : undefined,
                link: new URL($item.prop('href')!, currentUrl).href,
                language,
            };
        });

    items = items.slice(0, Math.max(20, limit));
    if (ctx.req.query('sorted') === 'false') {
        items = items.slice(0, limit);
    } else if (items.every((item) => item.pubDate instanceof Date && Number.isFinite(item.pubDate.getTime()))) {
        items.sort((a, b) => (b.pubDate as Date).getTime() - (a.pubDate as Date).getTime());
        items = items.slice(0, limit);
    }

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`hubu:content:${item.link}`, async () => {
                const detailResponse = await fetchHtml(item.link, page);
                const $$ = load(detailResponse);
                const title = $$('div.ar_title h1').text();
                if (!title) {
                    return {};
                }
                const description = $$('div.v_news_content').html();
                return {
                    title,
                    description,
                    category: $$('META[Name="keywords"]')
                        .toArray()
                        .flatMap((c) => ($$(c).attr('content') ?? '').split(','))
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    content: {
                        html: description,
                        text: $$('div.v_news_content').text(),
                    },
                };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    const title = $('title').text();
    const imageSrc = $('div.logo a img').prop('src');
    const image = imageSrc ? new URL(imageSrc, currentUrl).href : undefined;

    return {
        title,
        description: $('META[Name="keywords"]').prop('content'),
        link: currentUrl,
        item: items,
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
| dqgz                                          | dqgz/djgz/jgdj                                          | dqgz/ghgon                                          |`,
    categories: ['university'],

    features: {
        requireConfig: false,
        requirePuppeteer: true,
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
