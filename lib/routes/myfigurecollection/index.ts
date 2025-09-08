import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
import { isValidHost } from '@/utils/valid-host';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const shortcuts = {
    potd: 'picture/browse/potd/',
    potw: 'picture/browse/potw/',
    potm: 'picture/browse/potm/',
};

export const route: Route = {
    path: '/:category?/:language?',
    categories: ['shopping'],
    example: '/myfigurecollection/potd',
    parameters: { category: '分类，默认为每日圖片', language: '语言，见上表，默认为空，即 `en`' },
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
            source: ['zh.myfigurecollection.net/browse', 'zh.myfigurecollection.net/'],
        },
    ],
    name: '圖片',
    maintainers: ['nczitzk'],
    handler,
    url: 'zh.myfigurecollection.net/browse',
    description: `| 每日圖片 | 每週圖片 | 每月圖片 |
| -------- | -------- | -------- |
| potd     | potw     | potm     |`,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? '';
    const category = ctx.req.param('category') ?? 'figure';
    if (language && !isValidHost(language)) {
        throw new InvalidParameterError('Invalid language');
    }

    const rootUrl = `https://${language === 'en' || language === '' ? '' : `${language}.`}myfigurecollection.net`;
    const currentUrl = `${rootUrl}/${Object.hasOwn(shortcuts, category) ? shortcuts[category] : category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.item-icon, .picture-icon')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25)
        .toArray()
        .map((item) => {
            item = $(item).find('a');

            const link = item.attr('href');

            return {
                link: link.startsWith('http') ? link : `${rootUrl}${link}`,
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

                    item.title = content('.headline').text();
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        pictures: /myfigurecollection\.net\/picture\//.test(item.link)
                            ? [{ src: content('meta[property="og:image"]').attr('content') }]
                            : JSON.parse(decodeURIComponent(content('meta[name="pictures"]').attr('content'))),
                        fields: content('.form-field')
                            .toArray()
                            .map((f) => ({
                                key: content(f).find('.form-label').text(),
                                value: content(f).find('.form-input').text(),
                            })),
                    });
                } catch {
                    item.title = `Item #${item.link.split('/').pop()}`;
                }

                return item;
            })
        )
    );

    return {
        title: $('title')
            .text()
            .replace(/ \(.*\)/, ''),
        link: currentUrl,
        item: items,
    };
}
