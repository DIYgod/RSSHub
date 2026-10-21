import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/v/:category{.+}?',
    categories: ['traditional-media'],
    example: '/iqilu/v/sdws/sdxwlb',
    parameters: {
        category: '节目 id，可在对应节目页 URL 中找到，见下表，默认为 `sdws/sdxwlb`，即山东新闻联播',
    },
    features: {
        supportPodcast: true,
    },
    name: '电视节目',
    maintainers: ['nczitzk'],
    description: `| 节目名称         | 节目 id        |
| ---------------- | -------------- |
| 山东新闻联播     | sdws/sdxwlb    |
| 闪电大视野       | ggpd/sddsy     |
| 山东三农新闻联播 | nkpd/snxw      |
| 每日新闻         | qlpd/mrxw      |
| 新闻午班车       | ggpd/xwwbc     |
| 戏宇宙           | sdws/xyz/      |
| 中国礼 中国乐    | qlpd/zglzgy    |
| 超级语文课       | sdws/cjywk     |
| 文物里的山东     | yspd/wwldsd    |
| 拉呱             | qlpd/l0        |
| 生活帮           | shpd/shb       |
| 快乐大赢家       | zypd/kldyj     |
| 乡村季风         | nkpd/xcjf      |
| 健康是 1         | ggpd/jks1      |
| 此时此刻         | sdws/cishicike |`,
    handler,
};

const videoMimeTypes = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogv: 'video/ogg',
    m3u8: 'application/vnd.apple.mpegurl',
} satisfies Record<string, string>;
const isVideoExtension = (key: string): key is keyof typeof videoMimeTypes => Object.hasOwn(videoMimeTypes, key);

function getVideoMimeType(url?: string) {
    const extension = url ? new URL(url, 'http://v.iqilu.com').pathname.split('.').pop()!.toLowerCase() : undefined;
    return extension && isVideoExtension(extension) ? videoMimeTypes[extension] : undefined;
}

async function handler(ctx) {
    const { category = 'sdws/sdxwlb' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const rootUrl = 'http://v.iqilu.com';
    const currentUrl = `${rootUrl}/${category.replace(/\/?$/, '/')}`;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('#jmzhanshi1 dl')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const a = $item.find('a');
            const image = $item.find('img');

            $item.find('dd').last().remove();
            const date = $item
                .find('dd')
                .last()
                .text()
                .match(/\d{4}-\d{2}-\d{2}/)?.[0];

            return {
                title: a.prop('title') ?? '',
                link: a.prop('href'),
                description: renderDescription({
                    image: {
                        src: image.prop('src'),
                        alt: image.prop('alt'),
                    },
                }),
                pubDate: date ? timezone(parseDate(date, 'YYYY-MM-DD'), 8) : undefined,
                itunes_item_image: image.prop('src'),
            };
        });

    if (ctx.req.query('sorted') !== 'false' && items.every((item) => item.pubDate instanceof Date && Number.isFinite(item.pubDate.getTime()))) {
        items.sort((a, b) => (b.pubDate as Date).getTime() - (a.pubDate as Date).getTime());
    }
    if (ctx.req.query('sorted') === 'false' || items.every((item) => item.pubDate instanceof Date && Number.isFinite(item.pubDate.getTime()))) {
        items = items.slice(0, limit);
    }

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('div.vtitle').text();
                item.enclosure_url = content('#copy_mp4text').prop('value');
                item.enclosure_type = getVideoMimeType(item.enclosure_url);

                item.description = renderDescription({
                    image: {
                        src: item.itunes_item_image,
                        alt: item.title,
                    },
                    video: {
                        src: item.enclosure_url,
                        type: item.enclosure_type,
                    },
                });

                return item;
            }),
        { concurrency: 3 }
    );

    const icon = new URL($('link[rel="icon"]').prop('href')!, rootUrl).href;
    const author = $('div.host_pic dl dd a')
        .toArray()
        .map((a) => $(a).text())
        .join('/');

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-CN' as const,
        image: $('div.s_logo img').prop('src'),
        icon,
        logo: icon,
        author,
        itunes_author: author,
        itunes_category: 'News',
    };
}
