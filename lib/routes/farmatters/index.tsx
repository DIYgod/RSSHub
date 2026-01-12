import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import MarkdownIt from 'markdown-it';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const md = MarkdownIt({
    html: true,
});

const ids = {
    1: 0,
    2: 2,
    3: 1,
};

export const route: Route = {
    path: ['/exclusive/:locale?', '/news/:locale?', '/:locale?', '/:type/:id/:locale?'],
    categories: ['new-media'],
    example: '/farmatters/exclusive',
    parameters: { locale: 'Locale, `zh-CN` or `en-US`, `zh-CN` by default' },
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
            source: ['farmatters.com/exclusive'],
            target: '/exclusive',
        },
    ],
    name: 'Exclusive',
    maintainers: ['nczitzk'],
    handler,
    url: 'farmatters.com/news',
};

async function handler(ctx) {
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
        description: renderToString(
            <>
                {item.headImageUrl ? (
                    <figure>
                        <img src={item.headImageUrl} alt={item.title} />
                    </figure>
                ) : null}
                {item.content || item.summary ? raw(md.render(item.content ?? item.summary)) : null}
            </>
        ),
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

    return {
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
    };
}
