import { type Data, type DataItem, type Route, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import { getCurrentPath } from '@/utils/helpers';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { type CheerioAPI, type Cheerio, type Element, load } from 'cheerio';
import { type Context } from 'hono';
import path from 'node:path';

const __dirname = getCurrentPath(import.meta.url);

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://www.adquan.com';
    const targetUrl: string = baseUrl;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh-CN';

    let items: DataItem[] = [];

    items = $('div.article_1')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('p.article_2_p').text();
            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                intro: $el.find('div.article_1_fu p').first().text(),
            });
            const pubDateStr: string | undefined = $el.find('div.article_1_fu p').last().text();
            const linkUrl: string | undefined = $el.find('a.article_2_href').attr('href');
            const authors: DataItem['author'] = $el.find('div.article_4').text();
            const image: string | undefined = $el.find('img.article_1_img').attr('src');
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl,
                author: authors,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
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

                    const title: string = $$('p.infoTitle_left').text();
                    const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                        description: $$('div.articleContent').html(),
                    });
                    const pubDateStr: string | undefined = $$('p.time').text().split(/：/).pop();
                    const categoryEls: Element[] = $$('span.article_5').toArray();
                    const categories: string[] = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
                    const authors: DataItem['author'] = $$('div.infoTitle_right span').text();
                    const upDatedStr: string | undefined = pubDateStr;

                    const processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDateStr ? timezone(parseDate(pubDateStr), +8) : item.pubDate,
                        category: categories,
                        author: authors,
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

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img.navi_logo').attr('src'),
        author: $('meta[name="author"]').attr('content'),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/',
    name: '最新文章',
    url: 'www.adquan.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/adquan',
    parameters: undefined,
    description: undefined,
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
            source: ['www.adquan.com'],
            target: '/',
        },
    ],
    view: ViewType.Articles,
};
