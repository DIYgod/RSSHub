import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import { getMimeType } from 'hono/utils/mime';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Language, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/:language?',
    name: '每日环球视野',
    example: '/idaily',
    maintainers: ['zphw', 'nczitzk'],
    parameters: { language: '语言，见下表，默认为简体中文' },
    radar: [
        {
            source: ['idai.ly/'],
            target: '/',
        },
    ],
    handler,
    description: `| 简体中文 | 繁体中文 |
| -------- | -------- |
| zh-hans  | zh-hant  |`,
};

async function handler(ctx): Promise<Data> {
    const { language = 'zh-hans' } = ctx.req.param();
    if (!['zh-hans', 'zh-hant'].includes(language)) {
        throw new InvalidParameterError('Invalid language. Use zh-hans or zh-hant.');
    }
    const limit = getRouteLimit(ctx, 100);

    const rootUrl = 'https://idaily-cdn.idailycdn.com';
    const apiUrl = new URL(`api/list/v3/iphone/${language}`, rootUrl).href;
    const currentUrl = 'https://idai.ly';

    const { data: response } = await got(apiUrl);

    const articles = response
        .filter((item) => item.ui_sets?.caption_subtitle)

        .map((item) => {
            const image = item.ui_sets?.cover_landscape_hd_4k ?? item.cover_landscape_hd;

            return {
                title: `${item.ui_sets?.caption_subtitle} - ${item.title}`,
                link: item.link_share,
                description: renderDescription(
                    image
                        ? [
                              {
                                  src: image,
                                  alt: item.ui_sets?.caption_subtitle ?? item.title,
                              },
                          ]
                        : undefined,
                    item.content
                ),
                author: item.author || undefined,
                category: item.tags?.map((c) => c.name),
                guid: `idaily-${item.guid}`,
                pubDate: item.pubdate_timestamp ? parseDate(item.pubdate_timestamp, 'X') : undefined,
                updated: item.lastupdate_timestamp ? parseDate(item.lastupdate_timestamp, 'X') : undefined,
                enclosure_url: image,
                enclosure_type: image ? getMimeType(new URL(image).pathname) : undefined,
            };
        });

    const canSort = articles.every((item) => item.pubDate && Number.isFinite(item.pubDate.getTime()));
    if (ctx.req.query('sorted') !== 'false' && canSort) {
        articles.sort((a, b) => b.pubDate!.getTime() - a.pubDate!.getTime());
    }
    const items = articles.slice(0, ctx.req.query('sorted') === 'false' || canSort ? limit : Math.max(100, limit));

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const title = $('title').text();
    const image = new URL('img/idaily/logo_2x.png', currentUrl).href;

    return {
        item: items,
        title,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: (language === 'zh-hant' ? 'zh-TW' : 'zh-CN') satisfies Language,
        image,
        author: title.split(/\s/, 1)[0],
    };
}

type IdailyImage = {
    src?: string;
    alt?: string;
};

const renderDescription = (images: IdailyImage[] | undefined, intro?: string) => renderToString(<IdailyDescription images={images} intro={intro} />);

const IdailyDescription = ({ images, intro }: { images?: IdailyImage[]; intro?: string }) => (
    <>
        {images?.map((image) =>
            image?.src ? (
                <figure>
                    <img src={image.src} alt={image.alt} />
                </figure>
            ) : null
        )}
        {intro ? <p>{intro}</p> : null}
    </>
);
