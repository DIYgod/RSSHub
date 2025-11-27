import path from 'node:path';

import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '100', 10);

    const baseUrl: string = 'https://tf.121.com.cn';
    const imgBaseUrl: string = 'https://wx.121.com.cn';
    const targetUrl: string = new URL('web/weatherLive/', baseUrl).href;
    const apiUrl: string = new URL('weather/weibo/message.js', baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh';

    const response = await ofetch(apiUrl);
    const messages = await response.text();

    const items: DataItem[] = JSON.parse(messages.split(/var\smessage=/).pop())
        .slice(0, limit)
        .map((item): DataItem => {
            const title: string = item.Title;
            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                description: item.Content,
                images: item.Img?.map((img: string) => ({
                    src: new URL(`WeChat/data/weiweb/images/lwspic/${img}`, imgBaseUrl).href,
                    alt: title,
                })),
            });
            const pubDate: number | string = item.DDatetime;
            const linkUrl: string | undefined = targetUrl;
            const guid: string = `121-${title}-${pubDate}`;
            const image: string | undefined = item.Img?.length > 0 ? new URL(`WeChat/data/weiweb/images/lwspic/${item.Img[0]}`, imgBaseUrl).href : undefined;
            const updated: number | string = pubDate;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDate ? parseDate(pubDate) : undefined,
                link: linkUrl ?? new URL(item.id, baseUrl).href,
                guid,
                id: guid,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                updated: updated ? parseDate(updated) : undefined,
                language,
            };

            return processedItem;
        });

    const title: string = $('title').text();

    return {
        title,
        description: title,
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img').first().attr('src') ? new URL($('img').first().attr('src') as string, baseUrl).href : undefined,
        author: $('div#webnameDiv').text(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/weatherLive',
    name: '深圳天气直播',
    url: 'tf.121.com.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/121/weatherLive',
    parameters: undefined,
    description: undefined,
    categories: ['forecast'],
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
            source: ['tf.121.com.cn', 'tf.121.com.cn/web/weatherLive'],
            target: '/weatherLive',
        },
    ],
    view: ViewType.Notifications,
};
