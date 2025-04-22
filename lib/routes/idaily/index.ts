import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: ['/:language?'],
    name: '每日环球视野',
    example: '/idaily',
    maintainers: ['zphw', 'nczitzk'],
    parameters: { language: '语言，见下表，默认为简体中文' },
    radar: [
        {
            source: ['idai.ly/'],
        },
    ],
    handler,
    description: `| 简体中文 | 繁体中文 |
| -------- | -------- |
| zh-hans  | zh-hant  |`,
};

async function handler(ctx) {
    const { language = 'zh-hans' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 100;

    const rootUrl = 'https://idaily-cdn.idailycdn.com';
    const apiUrl = new URL(`api/list/v3/iphone/${language}`, rootUrl).href;
    const currentUrl = 'https://idai.ly';

    const { data: response } = await got(apiUrl);

    const items = response
        .filter((item) => item.ui_sets?.caption_subtitle)
        .slice(0, limit)
        .map((item) => {
            const image = item.ui_sets?.cover_landscape_hd_4k ?? item.cover_landscape_hd;

            return {
                title: `${item.ui_sets?.caption_subtitle} - ${item.title}`,
                link: item.link_share,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: item.ui_sets?.caption_subtitle ?? item.title,
                              },
                          ]
                        : undefined,
                    intro: item.content,
                }),
                author: item.location,
                category: item.tags?.map((c) => c.name),
                guid: `idaily-${item.guid}`,
                pubDate: parseDate(item.pubdate_timestamp, 'X'),
                updated: parseDate(item.lastupdate_timestamp, 'X'),
                enclosure_url: image,
                enclosure_type: `image/${image.split(/\./).pop()}`,
            };
        });

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const title = $('title').text();
    const image = new URL('img/idaily/logo_2x.png', currentUrl).href;

    return {
        item: items,
        title,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh',
        image,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author: title.split(/\s/)[0],
        allowEmpty: true,
    };
}
