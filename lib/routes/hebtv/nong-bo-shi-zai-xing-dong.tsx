import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { getRouteLimit } from '@/utils/route-limit';

const baseUrl = 'https://web.cmc.hebtv.com/cms/rmt0336/19/19js/st/ds/nmpd/nbszxd/index.shtml';

const renderDescription = (image, video) =>
    renderToString(
        <>
            {image?.src ? (
                <figure>
                    <img src={image.src} alt={image.alt} />
                </figure>
            ) : null}
            {video?.src ? (
                <video poster={video.poster} controls>
                    <source src={video.src} type={video.type} />
                    <object data={video.src}>
                        <embed src={video.src} />
                    </object>
                </video>
            ) : null}
        </>
    );

export const route: Route = {
    path: '/nbszxd',
    categories: ['traditional-media'],
    example: '/hebtv/nbszxd',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['web.cmc.hebtv.com/cms/rmt0336/19/19js/st/ds/nmpd/nbszxd/index.shtml'],
        },
    ],
    name: '农博士在行动',
    maintainers: ['iamqiz', 'nczitzk'],
    handler,
    url: 'web.cmc.hebtv.com/cms/rmt0336/19/19js/st/ds/nmpd/nbszxd/index.shtml',
};

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 40);
    const candidateLimit = ctx.req.query('sorted') === 'false' ? limit : Math.max(40, limit);

    const apiRootUrl = 'http://api.cmc.hebtv.com';
    const apiUrl = new URL('cmsback/api/article/getMyArticleDetail', apiRootUrl).href;

    const response = await got(baseUrl);
    const $ = load(response.data);

    // Read the current list page.
    const list = $('.video_box .tv_items')
        .first()
        .children()
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a').first();
            const timeMatch = a.text().match(/\d+/);
            const timestr = timeMatch ? timeMatch[0] : '';

            return {
                title: a.text(),
                // Resolve the relative article link against the list page.
                link: `${baseUrl}/../${a.attr('href')}`,
                pubDate: timestr ? parseDateInTimezone(timestr, 8) : undefined,
                author: '时间|' + timestr,
            };
        });

    const items = await pMap(
        list.slice(0, candidateLimit),
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data: detailResponse } = await got(item.link);

                const tenantId = detailResponse.match(/tenantid = '(\w+)';/)[1];
                const articleId = item.link!.match(/\/nbszxd\/(\d+)/)![1];

                const { data: apiResponse } = await got(apiUrl, {
                    searchParams: {
                        tenantId,
                        articleId,
                    },
                });

                const data = apiResponse.data;

                let videoData;
                if (data.articleContentDto?.videoDtoList?.length > 0) {
                    videoData = data.articleContentDto?.videoDtoList[0];
                }

                item.title = data.title;
                item.author = data.source;
                item.guid = `hebtv-nbszxd-${articleId}`;
                item.pubDate = data.publishDate ? parseDateInTimezone(data.publishDate, 8) : item.pubDate;
                item.updated = data.modifyTime ? parseDateInTimezone(data.modifyTime, 8) : undefined;

                if (videoData) {
                    item.itunes_item_image = videoData.poster;
                    const duration = data.articleContentDto?.videoEditDtoList?.[0]?.sourceMediaInfo?.duration;
                    item.itunes_duration = duration ? Number(duration) / 1000 : undefined;
                    item.enclosure_url = videoData.formats?.[0]?.url;
                    item.enclosure_type = item.enclosure_url ? `video/${new URL(item.enclosure_url).pathname.split('.').at(-1)}` : undefined;
                }

                item.description = renderDescription(
                    undefined,
                    videoData
                        ? {
                              src: item.enclosure_url,
                              type: item.enclosure_type,
                              poster: item.itunes_item_image,
                          }
                        : undefined
                );

                return item;
            }),
        { concurrency: 3 }
    );

    const description = $('meta[name="description"]').prop('content');
    const author = description?.split(/,/, 1)[0];
    const icon = $('link[rel="shortcut icon"]').prop('href');
    const language = $('html').prop('lang') as Language;

    return {
        item: items,
        title: $('title').text(),
        link: baseUrl,
        description,
        language,
        image: $('div.logo a img').prop('src'),
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author,
        itunes_author: author,
        itunes_category: 'News',
    };
}
