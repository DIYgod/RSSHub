import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

import { type CheerioAPI, type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';
import path from 'node:path';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'newslists', id } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://info.10000link.com';
    const targetUrl: string = new URL(`${category}.aspx${id ? `?chid=${id}` : ''}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = [];

    items = $('ul.l_newshot li dl.lhotnew2')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('dd h1 a');

            const title: string = $aEl.attr('title') ?? $aEl.text();
            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                intro: $el.find('dd.title_l').text(),
            });
            const pubDateStr: string | undefined = $el.find('span.ymd_w').text();
            const linkUrl: string | undefined = $aEl.attr('href');
            const categoryEls: Element[] = $el.find('dd.day-lx span a').toArray();
            const categories: string[] = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
            const authors: DataItem['author'] = $el.find('dd.day-lx span').first().text();
            const image: string | undefined = $el.find('dt.img220 a img').attr('src');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseRelativeDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                category: categories,
                author: authors,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                updated: upDatedStr ? parseRelativeDate(upDatedStr) : undefined,
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

                    const title: string = $$('div.entity_title h1 a').text();
                    const image: string | undefined = $$('div.entity_thumb img.img-responsive').attr('src');

                    const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                        images: image
                            ? [
                                  {
                                      src: image,
                                      alt: title,
                                  },
                              ]
                            : undefined,
                        description: $$('div.entity_content').html(),
                    });
                    const pubDateStr: string | undefined = detailResponse.match(/var\stime\s=\s"(.*?)";/)?.[1];
                    const categoryEls: Element[] = $$('div.entity_tag span a').toArray();
                    const categories: string[] = [...new Set([...categoryEls.map((el) => $$(el).text()), ...(item.category ?? [])].filter(Boolean))];
                    const upDatedStr: string | undefined = pubDateStr;

                    const processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
                        category: categories,
                        content: {
                            html: description,
                            text: description,
                        },
                        image,
                        banner: image,
                        updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
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

    const author: string = '10000万联网';
    const title: string = $('h1').contents().first().text();

    return {
        title: `${author} - ${title}`,
        description: title,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('a.navbar-brand img').attr('src') ? new URL($('a.navbar-brand img').attr('src') as string, baseUrl).href : undefined,
        author,
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/info/:category?/:id?',
    name: '新闻',
    url: 'info.10000link.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/10000link/info/newslists/My01',
    parameters: {
        category: {
            description: '分类，默认为 `newslists`，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '新闻',
                    value: 'newslists',
                },
                {
                    label: '物流',
                    value: 'newslogistics',
                },
                {
                    label: '供应链金融风控',
                    value: 'newsRisk',
                },
                {
                    label: '区块链',
                    value: 'newsBlockChain',
                },
                {
                    label: 'B2B',
                    value: 'newsBTwoB',
                },
                {
                    label: '跨境电商',
                    value: 'newsCrossborder',
                },
                {
                    label: '投融资',
                    value: 'newsInvestment',
                },
                {
                    label: '供应链管理',
                    value: 'newsManagement',
                },
                {
                    label: '供应链创新',
                    value: 'newsInnovation',
                },
                {
                    label: '数据',
                    value: 'newslists/A02',
                },
                {
                    label: '政策',
                    value: 'newslists/A03',
                },
                {
                    label: '规划',
                    value: 'newslists/A04',
                },
                {
                    label: '案例',
                    value: 'newslists/GL03',
                },
                {
                    label: '职场',
                    value: 'newslists/ZC',
                },
                {
                    label: '供应链票据',
                    value: 'newsBill',
                },
            ],
        },
        id: {
            description: 'ID，默认为空，可在对应分类页 URL 中找到',
        },
    },
    description: `:::tip
若订阅 [天下大势](https://info.10000link.com/newslists.aspx?chid=My01)，网址为 \`https://info.10000link.com/newslists.aspx?chid=My01\`，请截取 \`https://info.10000link.com/\` 到末尾 \`.aspx\` 的部分 \`newslists\` 作为 \`category\` 参数填入，而 \`My01\` 作为 \`id\` 参数填入，此时目标路由为 [\`/10000link/info/newslists/My01\`](https://rsshub.app/10000link/info/newslists/My01)。
:::

| 金融科技      | 物流          | 供应链金融风控 | 区块链         | B2B       |
| ------------- | ------------- | -------------- | -------------- | --------- |
| newsFinancial | newslogistics | newsRisk       | newsBlockChain | newsBTwoB |

| 跨境电商        | 投融资         | 供应链管理     | 供应链创新     | 数据          |
| --------------- | -------------- | -------------- | -------------- | ------------- |
| newsCrossborder | newsInvestment | newsManagement | newsInnovation | newslists/A02 |

| 政策          | 规划          | 案例           | 职场         | 供应链票据 |
| ------------- | ------------- | -------------- | ------------ | ---------- |
| newslists/A03 | newslists/A04 | newslists/GL03 | newslists/ZC | newsBill   |
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
            source: ['info.10000link.com/:category'],
            target: (params, url) => {
                const urlObj: URL = new URL(url);
                const id: string | undefined = urlObj.searchParams.get('chid') ?? undefined;
                const category: string = params.category;

                return `/10000link/info${category ? `/${category}${id ? `/${id}` : ''}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,
};
