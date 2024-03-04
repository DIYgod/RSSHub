// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const { category, city } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const rootUrl = 'https://cx.tesla.cn';
    const rootApiUrl = 'https://community-api.tesla.cn';
    const rootMediaApi = 'https://china-community-app.tesla.cn';

    const currentUrl = new URL(`user-right/list${category ? `/${category}` : ''}`, rootUrl).href;
    const apiUrl = new URL('api/voucherpackage/merchant', rootApiUrl).href;
    const apiCategoryUrl = new URL('api/category', rootApiUrl).href;

    const categoryToUrl = (category) => new URL(`user-right/list/${category}`, rootUrl).href;
    const mediaToUrl = (media) => new URL(`community-media/${media}`, rootMediaApi).href;

    art.defaults.imports.categoryToUrl = categoryToUrl;
    art.defaults.imports.mediaToUrl = mediaToUrl;

    const { data: categoryResponse } = await got(apiCategoryUrl, {
        searchParams: {
            type: 2,
        },
    });

    const categoryObject = categoryResponse.data.filter((c) => c.name === category).pop();

    const { data: response } = await got(apiUrl, {
        searchParams: {
            pageSize: limit,
            pageNumber: 0,
            benefitCategoryId: categoryObject?.id ?? undefined,
            category: categoryObject ? undefined : category === '充电免停' ? 2 : undefined,
            city,
        },
    });

    let items = response.data.pageDatas.slice(0, limit).map((item) => ({
        title: item.venueName ?? item.title,
        link: new URL(`user-right/detail/${item.id}`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            image: item.coverImage
                ? {
                      src: item.coverImage,
                      alt: item.venueName ?? item.title,
                  }
                : undefined,
            description: item.description?.replace(/\["|"]/g, '') ?? undefined,
            data: item.parkingLocationId
                ? {
                      title: item.venueName ?? item.title,
                      categories: [category],
                      description: `充电停车减免${item.parkingVoucherValue}小时`,
                  }
                : undefined,
        }),
        category: item.categories,
        guid: item.id,
        pubDate: parseDate(item.publishedAt),
        parkingLocationId: item.parkingLocationId,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.parkingLocationId) {
                    item.guid = `tesla-user-right#${item.guid}`;

                    delete item.parkingLocationId;

                    return item;
                }

                const apiItemUrl = new URL(`api/voucherpackage/merchant/${item.guid}`, rootApiUrl).href;

                const { data: detailResponse } = await got(apiItemUrl);

                const data = detailResponse.data;

                item.title = data.title ?? item.title;
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    data,
                });
                item.author = data.merchants ? data.merchants.map((a) => a.name).join('/') : undefined;
                item.category = [...new Set([...item.category, ...data.categories])].filter(Boolean);
                item.guid = `tesla-user-right#${item.guid}`;

                return item;
            })
        )
    );

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const author = $('title').text();
    const description = `${city ?? ''}${category ?? ''}`;
    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    ctx.set('data', {
        item: items,
        title: `${author}权益中心${description ? ` - ${description}` : ''}`,
        link: currentUrl,
        description,
        language: $('html').prop('lang'),
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        subtitle: description,
        author,
        allowEmpty: true,
    });
};
