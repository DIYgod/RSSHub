import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'Industry/Comment' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '15', 10);

    const baseUrl: string = 'https://www.chinaratings.com.cn';
    const targetUrl: string = new URL(`CreditResearch/${category.endsWith('/') ? category : `${category}/`}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = 'zh-CN';

    let items: DataItem[] = [];

    items = $('div.contRight ul.list li')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('a');

            const title: string = $aEl.text();
            const pubDateStr: string | undefined = $el.find('span').text();
            const linkUrl: string | undefined = $aEl.attr('href');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, targetUrl).href : undefined,
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
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

                    const title: string = $$('div.newshead h2, div.title h3').text();
                    const description: string = $$('div.news div.content').html() ?? '';

                    const metaStr: string = $$('div.newshead p span, div.title p span').text();
                    const pubDateStr: string | undefined = metaStr?.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
                    const authors: DataItem['author'] = metaStr?.match(/来源：(.*?)/)?.[1];
                    const upDatedStr: string | undefined = pubDateStr;

                    let processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                        author: authors,
                        content: {
                            html: description,
                            text: description,
                        },
                        updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
                        language,
                    };

                    const docUrl: string | undefined = detailResponse.match(/(\/upload\/docs\/\d{4}-\d{2}-\d{2}\/doc_\d+)"/)?.[1];
                    const enclosureUrl: string | undefined = docUrl ? `${new URL(docUrl, baseUrl).href}.pdf` : undefined;

                    if (enclosureUrl) {
                        processedItem = {
                            ...processedItem,
                            enclosure_url: enclosureUrl,
                            enclosure_type: 'application/pdf',
                            enclosure_title: title,
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

    const title: string = $('title').text();

    return {
        title,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('a.logo_c').attr('href') ? new URL($('a.logo_c').attr('href') as string, targetUrl).href : undefined,
        author: title.split(/-/).pop(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/CreditResearch/:category{.+}?',
    name: '中债研究',
    url: 'www.chinaratings.com.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/chinaratings/CreditResearch',
    parameters: {
        category: '分类，默认为 `Industry/Comment`，即行业评论，可在对应分类页 URL 中找到',
    },
    description: `::: tip
若订阅 [行业评论](https://www.chinaratings.com.cn/CreditResearch/Industry/Comment/)，网址为 \`https://www.chinaratings.com.cn/CreditResearch/Industry/Comment/\`，请截取 \`https://www.chinaratings.com.cn/CreditResearch/\` 到末尾 \`/\` 的部分 \`Industry/Comment\` 作为 \`category\` 参数填入，此时目标路由为 [\`/chinaratings/CreditResearch/Industry/Comment\`](https://rsshub.app/chinaratings/CreditResearch/Industry/Comment)。
:::
`,
    categories: ['finance'],
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
            source: ['www.chinaratings.com.cn/CreditResearch/:category'],
            target: (params) => {
                const category: string = params.category;

                return `/chinaratings/CreditResearch${category ? `/${category}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,
};
