import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 30);

    const baseUrl = 'https://jlpt.neea.cn';
    const targetUrl: string = new URL('index.do', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'zh-CN') as Language;

    let items: DataItem[] = $('div.indexcontent a')
        .slice(0, limit)
        .toArray()
        .map((el) => {
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
        await pMap(
            items,
            (item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link!);
                    const $$: CheerioAPI = load(detailResponse);

                    const title: string = $$('div.dvTitle').text();
                    const description = $$('div.dvContent').html();

                    const processedItem: DataItem = {
                        title,
                        description,
                    };

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            },
            { concurrency: 6 }
        )
    ).filter((_): _ is DataItem => true);

    const title: string = $('title').text();
    const imageUrl: string | undefined = $('div.header img').attr('src');

    return {
        title: `${title.split(/-/).pop()} - ${$('div.indexcontent h1').text()}`,
        description: title,
        link: targetUrl,
        item: items,
        image: imageUrl ? new URL(imageUrl, baseUrl).href : undefined,
        author: title.split(/-/, 1)[0],
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
