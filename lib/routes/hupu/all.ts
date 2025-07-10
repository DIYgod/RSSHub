import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/all/:id?',
    categories: ['bbs'],
    example: '/hupu/all/topic-daily',
    parameters: { id: '编号，可在对应热帖版面 URL 中找到，默认为步行街每日话题' },
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
            source: ['m.hupu.com/:category', 'm.hupu.com/'],
            target: '/:category',
        },
    ],
    name: '热帖',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
  更多热帖版面参见 [论坛](https://bbs.hupu.com)
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'topic-daily';

    const rootUrl = 'https://bbs.hupu.com';
    const currentUrl = `${rootUrl}/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('div.t-info > a, a.p-title')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `https://m.hupu.com/bbs${item.attr('href')}`,
                pubDate: timezone(parseDate(item.parent().parent().find('.post-time').text(), 'MM-DD HH:mm'), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    const videos = [];

                    content('.hupu-post-video').each(function () {
                        videos.push({
                            source: content(this).attr('src'),
                            poster: content(this).attr('poster'),
                        });
                    });

                    item.author = content('.bbs-user-wrapper-content-name-span').first().text();
                    item.pubDate = item.pubDate ?? timezone(parseRelativeDate(content('.second-line-user-info').first().text()), +8);
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        videos,
                        description: content('.bbs-content').first().html(),
                    });
                } catch {
                    // no-empty
                }

                return item;
            })
        )
    );

    return {
        title: `虎扑社区 - ${$('.middle-title, .bbs-sl-web-intro-detail-title').text()}`,
        link: currentUrl,
        item: items,
    };
}
