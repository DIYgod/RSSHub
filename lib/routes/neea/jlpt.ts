import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://jlpt.neea.cn';
    const targetUrl: string = new URL('index.do', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = $('div.indexcontent a')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.text();
            const pubDateStr: string | undefined = title.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
            const linkUrl: string | undefined = $el.attr('href');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
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

                    const title: string = $$('div.dvTitle').text();
                    const description: string = $$('div.dvContent').html() ?? '';

                    const processedItem: DataItem = {
                        title,
                        description,
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
        title: `${title.split(/-/).pop()} - ${$('div.indexcontent h1').text()}`,
        description: title,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('div.header img').attr('arc') ? new URL($('div.header img').attr('arc') as string, baseUrl).href : undefined,
        author: title.split(/-/)[0],
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/jlpt',
    name: '日本语能力测试 JLPT 通知',
    url: 'jlpt.neea.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/neea/jlpt',
    parameters: undefined,
    description: undefined,
    categories: ['study'],
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
            source: ['jlpt.neea.cn'],
            target: '/jlpt',
        },
    ],
    view: ViewType.Articles,
};
