import { type Data, type DataItem, type Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { type CheerioAPI, type Cheerio, type Element, load } from 'cheerio';
import { type Context } from 'hono';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'gzdt' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'http://www.gjs.moa.gov.cn';
    const targetUrl: string = new URL(category.endsWith('/') ? category : `${category}/`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = $('ul#div li')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const aEl: Cheerio<Element> = $el.find('a');

            const title: string = aEl.attr('title') ?? $el.find('span.sj_gztzle').text();
            const pubDateStr: string | undefined = $el.find('span.sj_gztzri').text();
            const linkUrl: string | undefined = aEl.attr('href');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: parseDate(pubDateStr),
                link: linkUrl ? new URL(linkUrl, targetUrl).href : undefined,
                updated: parseDate(upDatedStr),
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

                    const title: string = $$('meta[name="ArticleTitle"]').attr('content') ?? '';
                    const description: string = $$('div.TRS_Editor').html() ?? '';
                    const pubDateStr: string | undefined = $$('meta[name="PubDate"]').attr('content');
                    const linkUrl: string | undefined = $$('meta[name="Url"]').attr('content');
                    const categoryEls: Element[] = $$('meta[name="ColumnName"], meta[name="ContentSource"], meta[name="Keywords"]').toArray();
                    const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).attr('content') as string).filter(Boolean))];
                    const authors: DataItem['author'] = $$('meta[name="Author"]').attr('content');
                    const upDatedStr: string | undefined = pubDateStr;

                    let processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
                        link: linkUrl ?? item.link,
                        category: categories,
                        author: authors,
                        content: {
                            html: description,
                            text: description,
                        },
                        updated: upDatedStr ? timezone(parseDate(upDatedStr), +8) : item.updated,
                        language,
                    };

                    const $enclosureEl: Cheerio<Element> = $$('div.sj_fujianxia_right ul li a').first();
                    const enclosureUrl: string | undefined = $enclosureEl.attr('href');

                    if (enclosureUrl) {
                        const enclosureType: string = `application/${enclosureUrl.split('.').pop()}`;
                        const enclosureTitle: string = $enclosureEl.text();

                        processedItem = {
                            ...processedItem,
                            enclosure_url: new URL(enclosureUrl, item.link).href,
                            enclosure_type: enclosureType,
                            enclosure_title: enclosureTitle || title,
                        };
                    }

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    const author: string = '中华人民共和国农业农村部国际合作司';
    const description: string = $('meta[name="ColumnName"]').attr('content') ?? '';

    return {
        title: `${author} - ${description}`,
        description,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: new URL('images/logo-china.png', baseUrl).href,
        author,
        language,
    };
};

export const route: Route = {
    path: '/moa/gjs/:category{.+}?',
    name: '中华人民共和国农业农村部国际合作司',
    url: 'www.gjs.moa.gov.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/gov/moa/gjs/gzdt',
    parameters: {
        category: {
            description: '分类，默认为 `gzdt`，即工作动态，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '工作动态',
                    value: 'gzdt',
                },
                {
                    label: '通知公告',
                    value: 'tzgg',
                },
                {
                    label: '“一带一路”合作和农业走出去',
                    value: 'ydylhzhhnyzcq',
                },
                {
                    label: '农业国际贸易监测与展望',
                    value: 'ncpmy',
                },
                {
                    label: '多双边合作',
                    value: 'dsbhz',
                },
            ],
        },
    },
    description: `:::tip
若订阅 [中华人民共和国农业农村部国际合作司工作动态](https://www.gjs.moa.gov.cn/gzdt/)，网址为 \`https://www.gjs.moa.gov.cn/gzdt/\`，请截取 \`https://www.gjs.moa.gov.cn/\` 到末尾 \`/\` 的部分 \`gzdt\` 作为 \`category\` 参数填入，此时目标路由为 [\`/gov/moa/gjs/gzdt\`](https://rsshub.app/gov/moa/gjs/gzdt)。
:::

| [工作动态](http://www.gjs.moa.gov.cn/gzdt/) | [通知公告](http://www.gjs.moa.gov.cn/tzgg/) | [“一带一路”合作和农业走出去](http://www.gjs.moa.gov.cn/ydylhzhhnyzcq/) | [农业国际贸易监测与展望](http://www.gjs.moa.gov.cn/ncpmy/) | [多双边合作](http://www.gjs.moa.gov.cn/dsbhz/) |
| ------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| [gzdt](https://rsshub.app/gov/moa/gjs/gzdt) | [tzgg](https://rsshub.app/gov/moa/gjs/tzgg) | [ydylhzhhnyzcq](https://rsshub.app/gov/moa/gjs/ydylhzhhnyzcq)          | [ncpmy](https://rsshub.app/gov/moa/gjs/ncpmy)              | [dsbhz](https://rsshub.app/gov/moa/gjs/dsbhz)  |
`,
    categories: ['government'],
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
            source: ['www.gjs.moa.gov.cn/:category{.+}?'],
            target: (params) => {
                const category: string = params.category;

                return `/gov/moa/gjs${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '工作动态',
            source: ['www.gjs.moa.gov.cn/gzdt/'],
            target: '/moa/gjs/gzdt',
        },
        {
            title: '通知公告',
            source: ['www.gjs.moa.gov.cn/tzgg/'],
            target: '/moa/gjs/tzgg',
        },
        {
            title: '“一带一路”合作和农业走出去',
            source: ['www.gjs.moa.gov.cn/ydylhzhhnyzcq/'],
            target: '/moa/gjs/ydylhzhhnyzcq',
        },
        {
            title: '农业国际贸易监测与展望',
            source: ['www.gjs.moa.gov.cn/ncpmy/'],
            target: '/moa/gjs/ncpmy',
        },
        {
            title: '多双边合作',
            source: ['www.gjs.moa.gov.cn/dsbhz/'],
            target: '/moa/gjs/dsbhz',
        },
    ],
    view: ViewType.Articles,
};
