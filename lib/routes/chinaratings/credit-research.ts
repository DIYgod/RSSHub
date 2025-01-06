import { type CheerioAPI, type Cheerio, type Element, load } from 'cheerio';
import { type Context } from 'hono';

import { type DataItem, type Route, type Data, ViewType } from '@/types';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'Industry/Comment' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '15', 10);

    const baseUrl: string = 'https://www.chinaratings.com.cn';
    const targetUrl: string = new URL(`CreditResearch/${category.endsWith('/') ? category : `${category}/`}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language: string = $('html').attr('lang') ?? 'zh-CN';

    const items: DataItem[] = $('div.contRight ul.list li')
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
        })
        .filter((_): _ is DataItem => true);

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
    description: `:::tip
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
