import { type Data, type DataItem, type Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { type CheerioAPI, type Cheerio, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'zsxx1/zskx' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://zs.xjtu.edu.cn';
    const targetUrl: string = new URL(`${category}.htm`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = [];

    items = $('section.TextList ul li')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('a.flex');

            const title: string = $aEl.text();
            const pubDateStr: string | undefined = $el.find('b').text();
            const linkUrl: string | undefined = $aEl.attr('href');
            const categoryEls: Element[] = $el.find('i.zc').toArray();
            const categories: string[] = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, targetUrl).href : undefined,
                category: categories,
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

                    const title: string = $$('div.show01 h5').text();
                    const description: string | undefined = $$('div.v_news_content').html();
                    const pubDateStr: string | undefined = $$('div.show01 i')
                        .text()
                        ?.match(/(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/)?.[1];
                    const categoryEls: Element[] = $$('div.mianbao a').toArray().slice(1);
                    const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
                    const upDatedStr: string | undefined = pubDateStr;

                    const processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
                        category: categories,
                        content: {
                            html: description,
                            text: description,
                        },
                        updated: upDatedStr ? timezone(parseDate(upDatedStr), +8) : item.updated,
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

    const title: string = $('title').text();

    return {
        title,
        description: title.split(/-/)[0],
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('div.logoimg img').attr('src'),
        author: $('META[Name="keywords"]').attr('Content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/zs/:category{.+}?',
    name: '本科招生网',
    url: 'zs.xjtu.edu.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/xjtu/zs/zsxx1/zskx',
    parameters: {
        category: {
            description: '分类，默认为 zsxx1/zskx，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '招生快讯',
                    value: 'zsxx1/zskx',
                },
                {
                    label: '招生政策',
                    value: 'zsxx1/zszc',
                },
                {
                    label: '招生计划',
                    value: 'zsxx1/zsjh',
                },
                {
                    label: '阳光公告',
                    value: 'zsxx1/yggg',
                },
                {
                    label: '历年录取',
                    value: 'zsxx1/lnlq',
                },
            ],
        },
    },
    description: `:::tip
若订阅 [招生快讯](https://zs.xjtu.edu.cn/zsxx1/zskx.htm)，网址为 \`https://zs.xjtu.edu.cn/zsxx1/zskx.htm\`，请截取 \`https://zs.xjtu.edu.cn/\` 到末尾 \`.htm\` 的部分 \`zsxx1/zskx\` 作为 \`category\` 参数填入，此时目标路由为 [\`/xjtu/zs/zsxx1/zskx\`](https://rsshub.app/xjtu/zs/zsxx1/zskx)。
:::

| [招生快讯](https://zs.xjtu.edu.cn/zsxx1/zskx.htm)   | [招生政策](https://zs.xjtu.edu.cn/zsxx1/zszc.htm)   | [招生计划](https://zs.xjtu.edu.cn/zsxx1/zsjh.htm)   | [阳光公告](https://zs.xjtu.edu.cn/zsxx1/yggg.htm)   | [历年录取](https://zs.xjtu.edu.cn/zsxx1/lnlq.htm)   |
| --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| [zsxx1/zskx](https://rsshub.app/xjtu/zs/zsxx1/zskx) | [zsxx1/zszc](https://rsshub.app/xjtu/zs/zsxx1/zszc) | [zsxx1/zsjh](https://rsshub.app/xjtu/zs/zsxx1/zsjh) | [zsxx1/yggg](https://rsshub.app/xjtu/zs/zsxx1/yggg) | [zsxx1/lnlq](https://rsshub.app/xjtu/zs/zsxx1/lnlq) |
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
            source: ['zs.xjtu.edu.cn/:category'],
            target: (params) => {
                const category: string = params.category;

                return `/xjtu/zs${category ? `/${category}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,
};
