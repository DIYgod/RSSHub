import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const titles = {
    focus: {
        tc: '要聞',
        sc: '要闻',
    },
    instant: {
        tc: '快訊',
        sc: '快讯',
    },
    local: {
        tc: '港澳',
        sc: '港澳',
    },
    greaterchina: {
        tc: '兩岸',
        sc: '两岸',
    },
    world: {
        tc: '國際',
        sc: '国际',
    },
    finance: {
        tc: '財經',
        sc: '财经',
    },
    sports: {
        tc: '體育',
        sc: '体育',
    },
    parliament: {
        tc: '法庭',
        sc: '法庭',
    },
    weather: {
        tc: '天氣',
        sc: '天气',
    },
};

export const route: Route = {
    path: '/news/:category?/:language?',
    categories: ['traditional-media'],
    example: '/tvb/news',
    parameters: { category: '分类，见下表，默认为要聞', language: '语言，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['tvb.com/:language/:category', 'tvb.com/'],
        },
    ],
    name: '新闻',
    maintainers: ['nczitzk'],
    handler,
    description: `分类

| 要聞  | 快訊    | 港澳  | 兩岸         | 國際  | 財經    | 體育   | 法庭       | 天氣    |
| ----- | ------- | ----- | ------------ | ----- | ------- | ------ | ---------- | ------- |
| focus | instant | local | greaterchina | world | finance | sports | parliament | weather |

  语言

| 繁 | 简 |
| -- | -- |
| tc | sc |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'focus';
    const language = ctx.req.param('language') ?? 'tc';

    const rootUrl = 'https://inews-api.tvb.com';
    const linkRootUrl = 'https://news.tvb.com';
    const apiUrl = `${rootUrl}/news/entry/category`;
    const currentUrl = `${rootUrl}/${language}/${category}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
        searchParams: {
            id: category,
            lang: language,
            page: 1,
            limit: ctx.req.query('limit') ?? 50,
            country: 'HK',
        },
    });

    const items = response.data.content.map((item) => ({
        title: item.title,
        link: `${linkRootUrl}/${language}/${category}/${item.id}`,
        pubDate: parseDate(item.publish_datetime),
        category: [...item.category.map((c) => c.title), ...item.tags],
        description: art(path.join(__dirname, 'templates/description.art'), {
            description: item.desc,
            images: item.media.image?.map((i) => i.thumbnail.replace(/_\d+x\d+\./, '.')) ?? [],
        }),
    }));

    return {
        title: `${response.data.meta.title} - ${titles[category][language]}`,
        link: currentUrl,
        item: items,
    };
}
