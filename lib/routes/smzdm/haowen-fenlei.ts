import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getHeaders } from './utils';

export const route: Route = {
    path: '/haowen/fenlei/:name',
    categories: ['shopping'],
    example: '/smzdm/haowen/fenlei/shenghuodianqi',
    parameters: { name: '分类名，可在 URL 中查看' },
    features: {
        requireConfig: [
            {
                name: 'SMZDM_COOKIE',
                optional: true,
                description: '什么值得买登录后的 Cookie 值',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.smzdm.com/fenlei/:name'],
            target: '/haowen/fenlei/:name',
        },
    ],
    name: '好文分类',
    maintainers: ['LogicJake'],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const link = `https://www.smzdm.com/fenlei/${name}/`;

    const response = await ofetch.raw(link, {
        headers: getHeaders(),
    });
    const cookie = getHeaders().cookie || [...response.headers.getSetCookie().map((c) => c.split(';', 1)[0]), `x-waf-captcha-referer=${link}`].join('; ');
    const $ = load(response._data);
    const title = $('title').text().split('_', 1)[0];

    const payload = JSON.parse($('#__NUXT_DATA__').text());
    const list: DataItem[] = payload
        .filter((entry) => entry instanceof Object && 'article_title' in entry && 'article_no_format_date' in entry)
        .map((entry) => ({
            title: payload[entry.article_title],
            link: payload[entry.article_url],
            description: payload[entry.article_content],
            image: payload[entry.article_pic],
            category: [payload[entry.article_channel_name], ...(payload[entry.article_tag] ?? []).map((tag) => payload[payload[tag].article_title])],
            pubDate: timezone(parseDate(payload[entry.article_no_format_date]), 8),
        }));

    const out = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                try {
                    const response = await ofetch(item.link!, {
                        headers: {
                            cookie,
                        },
                    });
                    const $ = load(response);
                    item.description = $('article').html() ?? item.description;
                    item.pubDate = timezone(parseDate($('meta[property="og:release_date"]').attr('content')!), 8);
                    item.author = $('meta[property="og:author"]').attr('content')!;
                } catch {
                    // 404
                }

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: `${title}- 什么值得买好文分类`,
        image: $('.avatar-img').attr('src'),
        link,
        item: out,
    };
}
