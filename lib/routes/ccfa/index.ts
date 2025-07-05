import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const handler = async (ctx) => {
    const { type = '1' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'http://www.ccfa.org.cn';
    const currentUrl = new URL(`portal/cn/xiehui_list.jsp?type=${type}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.page_right ul li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');

            return {
                title: a.text(),
                pubDate: parseDate(item.find('span.list_time').text(), 'YYYY/MM/DD'),
                link: new URL(a.prop('href'), currentUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.includes('ccfa.org.cn')) {
                    return item;
                }

                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h2#title').text();
                const description = art(path.join(__dirname, 'templates/description.art'), {
                    intro: $$('div.artical_info_jianjie').html(),
                    description: $$('div.news_artical_txt').html(),
                });

                const pubDate =
                    $$('div.artical_info_left')
                        .text()
                        .match(/(\d{4}(?:\/\d{2}){2})/)?.[1] ?? undefined;

                item.title = title;
                item.description = description;
                item.pubDate = pubDate ? parseDate(pubDate, 'YYYY/MM/DD') : item.pubDate;
                item.author = $$('div.artical_info_left')
                    .text()
                    .split(/来源：/)
                    .pop();
                item.content = {
                    html: description,
                    text: $$('div.news_artical_txt').text(),
                };

                const attachmentEl =
                    $$('p.download').length === 0
                        ? undefined
                        : $$('div.news_artical_txt a')
                              .toArray()
                              .find((a) => $$(a).prop('href')?.includes('downFiles.do'));

                item.enclosure_url = attachmentEl ? new URL($$(attachmentEl).prop('href'), rootUrl) : undefined;
                item.enclosure_title = attachmentEl ? $$(attachmentEl).text() : undefined;

                return item;
            })
        )
    );

    const description = $('li.page_tit').contents().last().text().split(/>/).pop();
    const image = new URL($('div.logo img').prop('src'), currentUrl).href;
    const author = $('title').text();

    return {
        title: `${author} - ${description}`,
        description,
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[property="og:site_name"]').prop('content'),
    };
};

export const route: Route = {
    path: '/:type?',
    name: '分类',
    url: 'www.ccfa.org.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/ccfa/1',
    parameters: { category: '分类，默认为 `1`，即协会动态，可在对应分类页 URL 中找到' },
    description: `::: tip
  若订阅 [协会动态](https://www.ccfa.org.cn/portal/cn/xiehui_list.jsp?type=1)，网址为 \`https://www.ccfa.org.cn/portal/cn/xiehui_list.jsp?type=1\`。截取 \`https://www.ccfa.org.cn/portal/cn/xiehui_list.jsp?type=\` 到末尾的部分 \`1\` 作为参数填入，此时路由为 [\`/ccfa/1\`](https://rsshub.app/ccfa/1)。
:::

| 分类                                                                      | ID                                     |
| ------------------------------------------------------------------------- | -------------------------------------- |
| [协会动态](http://www.ccfa.org.cn/portal/cn/xiehui_list.jsp?type=1)       | [1](https://rsshub.app/ccfa/1)         |
| [行业动态](http://www.ccfa.org.cn/portal/cn/xiehui_list.jsp?type=2)       | [2](https://rsshub.app/ccfa/2)         |
| [政策/报告/标准](http://www.ccfa.org.cn/portal/cn/hybz_list.jsp?type=33)  | [33](https://rsshub.app/ccfa/33)       |
| [行业统计](http://www.ccfa.org.cn/portal/cn/lsbq.jsp?type=10003)          | [10003](https://rsshub.app/ccfa/10003) |
| [创新案例](http://www.ccfa.org.cn/portal/cn/hybzs_list.jsp?type=10004)    | [10004](https://rsshub.app/ccfa/10004) |
| [党建工作](http://www.ccfa.org.cn/portal/cn/xiehui_list.jsp?type=7)       | [7](https://rsshub.app/ccfa/7)         |
| [新消费论坛](http://www.ccfa.org.cn/portal/cn/xiehui_list.jsp?type=10005) | [10005](https://rsshub.app/ccfa/10005) |

#### [政策/报告/标准](http://www.ccfa.org.cn/portal/cn/hybz_list.jsp?type=33)

| 分类                                                                            | ID                               |
| ------------------------------------------------------------------------------- | -------------------------------- |
| [行业报告](http://www.ccfa.org.cn/portal/cn/hybz_list.jsp?type=33)              | [33](https://rsshub.app/ccfa/33) |
| [行业标准](http://www.ccfa.org.cn/portal/cn/hybz_list.jsp?type=34)              | [34](https://rsshub.app/ccfa/34) |
| [行业政策](http://www.ccfa.org.cn/portal/cn/fangyizhuanqu_list.jsp?type=39)     | [39](https://rsshub.app/ccfa/39) |
| [政策权威解读](http://www.ccfa.org.cn/portal/cn/fangyizhuanqu_list.jsp?type=40) | [40](https://rsshub.app/ccfa/40) |
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
            source: [
                'www.ccfa.org.cn/portal/cn/xiehui_list.jsp',
                'www.ccfa.org.cn/portal/cn/hybz_list.jsp',
                'www.ccfa.org.cn/portal/cn/lsbq.jsp',
                'www.ccfa.org.cn/portal/cn/hybzs_list.jsp',
                'www.ccfa.org.cn/portal/cn/fangyizhuanqu_list.jsp',
            ],
            target: (_, url) => {
                url = new URL(url);
                const type = url.searchParams.get('type');

                return type ? `/${type}` : '';
            },
        },
        {
            title: '协会动态',
            source: ['www.ccfa.org.cn/portal/cn/xiehui_list.jsp'],
            target: '/1',
        },
        {
            title: '行业动态',
            source: ['www.ccfa.org.cn/portal/cn/xiehui_list.jsp'],
            target: '/2',
        },
        {
            title: '政策/报告/标准',
            source: ['www.ccfa.org.cn/portal/cn/hybz_list.jsp'],
            target: '/33',
        },
        {
            title: '行业统计',
            source: ['www.ccfa.org.cn/portal/cn/lsbq.jsp'],
            target: '/10003',
        },
        {
            title: '创新案例',
            source: ['www.ccfa.org.cn/portal/cn/hybzs_list.jsp'],
            target: '/10004',
        },
        {
            title: '党建工作',
            source: ['www.ccfa.org.cn/portal/cn/xiehui_list.jsp'],
            target: '/7',
        },
        {
            title: '新消费论坛',
            source: ['www.ccfa.org.cn/portal/cn/xiehui_list.jsp'],
            target: '/10005',
        },
        {
            title: '政策/报告/标准 - 行业报告',
            source: ['www.ccfa.org.cn/portal/cn/hybz_list.jsp'],
            target: '/33',
        },
        {
            title: '政策/报告/标准 - 行业标准',
            source: ['www.ccfa.org.cn/portal/cn/hybz_list.jsp'],
            target: '/34',
        },
        {
            title: '政策/报告/标准 - 行业政策',
            source: ['www.ccfa.org.cn/portal/cn/fangyizhuanqu_list.jsp'],
            target: '/39',
        },
        {
            title: '政策/报告/标准 - 政策权威解读',
            source: ['www.ccfa.org.cn/portal/cn/fangyizhuanqu_list.jsp'],
            target: '/40',
        },
    ],
};
