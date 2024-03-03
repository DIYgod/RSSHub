// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
const md = require('markdown-it')({
    html: true,
});

const ids = {
    1: 0,
    2: 2,
    3: 1,
};

export default async (ctx) => {
    const { type, id, locale = 'zh-CN' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const searchParams = {
        locale,
        page: 0,
        pagesize: limit,
    };

    if (type === 'wiki' && id) {
        searchParams.subCatalogId = id;
    } else if (type && id) {
        searchParams[type] = id;
    }

    const rootUrl = 'https://farmatters.com';
    const apiUrl = new URL('api/v1/doc/list', rootUrl).href;
    const currentUrl = new URL(`${locale === 'zh-CN' ? '' : 'en/'}${type ? (type === 'wiki' ? 'wiki' : `tag/${id}`) : 'news'}`, rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams,
        https: {
            rejectUnauthorized: false,
        },
    });

    const items = response.data.list.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(`doc/${item.id}`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            image: item.headImageUrl
                ? {
                      src: item.headImageUrl,
                      alt: item.title,
                  }
                : undefined,
            description: md.render(item.content ?? item.summary),
        }),
        author: item.author,
        category: [item.catalogName, item.subCatalogName ?? undefined, ...(item.tags?.map((t) => t.tagName) ?? [])].filter(Boolean),
        guid: `farmatters-${item.id}`,
        pubDate: timezone(parseDate(item.createdAt), +8),
    }));

    const { data: currentResponse } = await got(currentUrl, {
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = load(currentResponse);

    const subtitle = `${$('h4').first().text()}${type === 'wiki' ? ` - ${$('div.css-6f6728 div.MuiBox-root').eq(ids[id]).text()}` : ''}`;
    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.set('data', {
        item: items,
        title: `${$('title').text().split(/-/)[0].trim()} - ${subtitle}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image: new URL($('img').first().prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle,
        allowEmpty: true,
    });
};
