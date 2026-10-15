import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const indexs = {
    gnxw: 0,
    gjxw: 1,
};

interface VideoInfo {
    errcode: number;
    cover_pic?: string;
    synopsis?: string;
    om_info?: { title?: string };
}

export const route: Route = {
    path: '/yjxw/:category?',
    categories: ['forecast'],
    example: '/cneb/yjxw',
    parameters: { category: '分类，见下表，默认为全部' },
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
            source: ['cneb.gov.cn/yjxw/:category?', 'cneb.gov.cn/'],
        },
    ],
    name: '应急新闻',
    maintainers: ['nczitzk'],
    handler,
    description: `| 全部 | 国内新闻 | 国际新闻 |
| ---- | -------- | -------- |
|      | gnxw     | gjxw     |`,
};

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 400);

    const category = ctx.req.param('category') ?? '';
    const index = Object.hasOwn(indexs, category) ? indexs[category] : -1;

    const rootUrl = 'http://www.cneb.gov.cn';
    const currentUrl = `${rootUrl}/yjxw${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    if (index !== -1) {
        const otherIndex = Math.abs(index - 1);

        $('.first-data').eq(otherIndex).remove();
        $('.moreContent').eq(otherIndex).remove();
    }

    let items = $('.list')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const a = $item.find('a');

            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: timezone(parseDate($item.find('span').text()), 8),
            };
        });

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const videoState = content('script[statesync="video"]')
                    .text()
                    .trim()
                    .match(/^window\.__STATE_video__\s*=\s*(\{[\s\S]*\});?$/);
                if (videoState) {
                    const video: VideoInfo = JSON.parse(videoState[1]).payloads.sharevideo;
                    if (video.errcode !== 0) {
                        throw new Error(`Video metadata is unavailable at ${item.link}`);
                    }
                    const description = content('<div/>');
                    if (video.cover_pic) {
                        description.append(content('<img/>').attr('src', video.cover_pic));
                        item.image = video.cover_pic;
                    }
                    if (video.synopsis && video.synopsis !== item.title) {
                        description.append(content('<p/>').text(video.synopsis));
                    }
                    item.description = description.html();
                    item.author = video.om_info?.title;
                } else {
                    content('.w940 .editor').remove();
                    item.description = content('.w940').html();
                    item.author = content('.source span').last().text();
                }

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: `国家应急广播 - ${index === -1 ? '新闻' : $('.select').text()}`,
        link: currentUrl,
        item: items,
    };
}
