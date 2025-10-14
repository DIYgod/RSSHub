import { type Data, type DataItem, type Route, ViewType } from '@/types';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { type CheerioAPI, type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category, id } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'http://load.grainoil.com.cn';
    const targetUrl: string = new URL(`${category}/${id}.jspx`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = $('div.m_listpagebox ol li a')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('b').text();
            const pubDateStr: string | undefined = $el.find('span').text().trim();
            const linkUrl: string | undefined = $el.attr('href');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : undefined,
                link: linkUrl,
                updated: upDatedStr ? timezone(parseDate(upDatedStr), +8) : undefined,
                language,
            };

            return processedItem;
        });

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('div.m_tit h2').text();
                    const description: string = $$('div.TRS_Editor').html() ?? '';
                    const authors: DataItem['author'] = $$('div.m_tit h2 a').first().text();

                    const processedItem: DataItem = {
                        title,
                        description,
                        author: authors,
                        content: {
                            html: description,
                            text: description,
                        },
                        language,
                    };

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    return {
        title: $('title').text(),
        description: $('meta[http-equiv="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('div.top_logo img').attr('src') ? new URL($('div.top_logo img').attr('src') as string, baseUrl).href : undefined,
        author: $('meta[http-equiv="keywords"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/:category/:id',
    name: '分类',
    url: 'load.grainoil.com.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/grainoil/newsListHome/3',
    parameters: {
        category: {
            description: '分类，默认为 `newsListHome`，可在对应分类页 URL 中找到',
            options: [
                {
                    label: 'newsListHome',
                    value: 'newsListHome',
                },
                {
                    label: 'newsListChannel',
                    value: 'newsListChannel',
                },
            ],
        },
        id: {
            description: '分类 ID，可在对应分类页 URL 中找到',
        },
    },
    description: `::: tip
若订阅 [政务信息](http://load.grainoil.com.cn/newsListHome/1430.jspx)，网址为 \`http://load.grainoil.com.cn/newsListHome/1430.jspx\`，请截取 \`https://load.grainoil.com.cn/\` 到末尾 \`.jspx\` 的部分 \`newsListHome/1430\` 作为 \`category\` 和 \`id\`参数填入，此时目标路由为 [\`/grainoil/newsListHome/1430\`](https://rsshub.app/grainoil/newsListHome/1430)。
:::

<details>
  <summary>更多分类</summary>

| 分类     | ID                 |
| -------- | ------------------ |
| 政务信息 | newsListHome/1430  |
| 要闻动态 | newsListHome/3     |
| 产业经济 | newsListHome/1469  |
| 产业信息 | newsListHome/1471  |
| 爱粮节粮 | newsListHome/1470  |
| 政策法规 | newsListChannel/18 |
| 生产气象 | newsListChannel/19 |
| 统计资料 | newsListChannel/20 |
| 综合信息 | newsListChannel/21 |

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
            source: ['load.grainoil.com.cn/:category/:id'],
            target: (params) => {
                const category: string = params.category;
                const id: string = params.id;

                return `/grainoil/${category}/${id}`;
            },
        },
        {
            title: '政务信息',
            source: ['load.grainoil.com.cn/newsListHome/1430.jspx'],
            target: '/newsListHome/1430',
        },
        {
            title: '要闻动态',
            source: ['load.grainoil.com.cn/newsListHome/3.jspx'],
            target: '/newsListHome/3',
        },
        {
            title: '产业经济',
            source: ['load.grainoil.com.cn/newsListHome/1469.jspx'],
            target: '/newsListHome/1469',
        },
        {
            title: '产业信息',
            source: ['load.grainoil.com.cn/newsListHome/1471.jspx'],
            target: '/newsListHome/1471',
        },
        {
            title: '爱粮节粮',
            source: ['load.grainoil.com.cn/newsListHome/1470.jspx'],
            target: '/newsListHome/1470',
        },
        {
            title: '政策法规',
            source: ['load.grainoil.com.cn/newsListChannel/18.jspx'],
            target: '/newsListChannel/18',
        },
        {
            title: '生产气象',
            source: ['load.grainoil.com.cn/newsListChannel/19.jspx'],
            target: '/newsListChannel/19',
        },
        {
            title: '统计资料',
            source: ['load.grainoil.com.cn/newsListChannel/20.jspx'],
            target: '/newsListChannel/20',
        },
        {
            title: '综合信息',
            source: ['load.grainoil.com.cn/newsListChannel/21.jspx'],
            target: '/newsListChannel/21',
        },
    ],
    view: ViewType.Articles,
};
