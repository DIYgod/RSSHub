// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { art } from '@/utils/render';
import * as path from 'node:path';

const baseUrl = 'https://web.cmc.hebtv.com/cms/rmt0336/19/19js/st/ds/nmpd/nbszxd/index.shtml';

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 40;

    const apiRootUrl = 'http://api.cmc.hebtv.com';
    const apiUrl = new URL('cmsback/api/article/getMyArticleDetail', apiRootUrl).href;

    const response = await got(baseUrl);
    const $ = load(response.data);

    // 获取当前页面的 list
    const list = $('.video_box .tv_items')
        .first()
        .children()
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            const timeMatch = a.text().match(/\d+/);
            const timestr = timeMatch ? timeMatch[0] : '';

            return {
                title: a.text(),
                // `link` 需要一个绝对 URL，但 `a.attr('href')` 返回一个相对 URL。
                link: `${baseUrl}/../${a.attr('href')}`,
                pubDate: timestr ? timezone(parseDate(timestr, 'YYYYMMDD'), +8) : null,
                author: '时间|' + timestr,
            };
        });

    const items = await Promise.all(
        list.slice(0, limit).map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const tenantId = detailResponse.match(/tenantid = '(\w+)';/)[1];
                const articleId = item.link.match(/\/nbszxd\/(\d+)/)[1];

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
                item.pubDate = timezone(parseDate(data.publishDate), +8);
                item.updated = timezone(parseDate(data.modifyTime), +8);

                if (videoData) {
                    item.itunes_item_image = videoData.poster;
                    item.itunes_duration = data.articleContentDto?.videoEditDtoList[0]?.sourceMediaInfo?.duration;
                    item.enclosure_url = videoData.formats[0]?.url;
                    item.enclosure_length = data.articleContentDto?.videoEditDtoList[0].sourceMediaInfo?.fileSize;
                    item.enclosure_type = item.enclosure_url ? `video/${item.enclosure_url?.split(/\./)?.pop()}` : undefined;
                }

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    video: videoData
                        ? {
                              src: item.enclosure_url,
                              type: item.enclosure_type,
                              poster: item.itunes_item_image,
                          }
                        : undefined,
                });

                return item;
            })
        )
    );

    const description = $('meta[name="description"]').prop('content');
    const author = description.split(/,/)[0];
    const icon = $('link[rel="shortcut icon"]').prop('href');

    ctx.set('data', {
        item: items,
        title: $('title').text(),
        link: baseUrl,
        description,
        language: $('html').prop('lang'),
        image: $('div.logo a img').prop('src'),
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author,
        itunes_author: author,
        itunes_category: 'News',
        allowEmpty: true,
    });
};
