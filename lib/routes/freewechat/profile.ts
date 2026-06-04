import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { fixArticleContent } from '@/utils/wechat-mp';

const baseUrl = 'https://freewechat.com';

export const route: Route = {
    path: '/profile/:id',
    categories: ['new-media'],
    example: '/freewechat/profile/MzI5NTUxNzk3OA==',
    parameters: { id: '公众号 ID，可在URL中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['freewechat.com/profile/:id'],
        },
    ],
    name: '公众号',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const url = `${baseUrl}/profile/${id}`;
    const { data: response } = await got(url, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });
    const $ = load(response);
    const author = $('h2').text().trim();

    const list = $('.main')
        .toArray()
        .slice(0, -1) // last item is a template
        .map((item) => {
            item = $(item);
            const a = item.find('h3 a');
            return {
                title: a.text().trim(),
                author,
                link: `${baseUrl}${a.attr('href')}`,
                description: item.find('.preview').text(),
                category: item.find('.classification').text().trim(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link, {
                    headers: {
                        Referer: url,
                        'User-Agent': config.trueUA,
                    },
                });
                const $ = load(response.data);

                $('.js_img_placeholder').remove();
                $('amp-img').each((_, e) => {
                    e = $(e);
                    e.replaceWith(`<img src="${new URL(e.attr('src'), item.link).href}" width="${e.attr('width')}" height="${e.attr('height')}" decoding="async">`);
                });
                $('amp-video').each((_, e) => {
                    e = $(e);
                    e.replaceWith(`<video width="${e.attr('width')}" height="${e.attr('height')}" controls poster="${e.attr('poster')}">${e.html()}</video>`);
                });

                item.description = fixArticleContent($('#js_content'));
                item.pubDate = timezone(parseDate($('#publish_time').text()), +8);
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link: url,
        image: 'https://freewechat.com/favicon.ico',
        item: items,
    };
}
