import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { config } from '@/config';
import { FetchError } from 'ofetch';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import { getCurrentPath } from '@/utils/helpers';
import path from 'node:path';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['traditional-media'],
    example: '/lorientlejour/977-lebanon',
    parameters: {
        category: 'Category from the last segment of the URL of the corresponding site, see below for more information, /977-Lebanon by default',
    },
    features: {
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        requireConfig: [
            {
                name: 'LORIENTLEJOUR_USERNAME',
                optional: true,
                description: `L'Orient-Le Jour/L'Orient Today Email or Username`,
            },
            {
                name: 'LORIENTLEJOUR_PASSWORD',
                optional: true,
                description: `L'Orient-Le Jour/L'Orient Today Password`,
            },
            {
                name: 'LORIENTLEJOUR_TOKEN',
                optional: true,
                description: `To obtain a token, log into L'Orient-Le Jour/L'Orient Today App and inspect the connection request to find the token parameter from the request URL`,
            },
        ],
    },
    name: 'Category',
    maintainers: ['quiniapiezoelectricity'],
    handler,
    description: `  :::tip
  For example, the path for the sites https://today.lorientlejour.com/section/977-lebanon and https://www.lorientlejour.com/rubrique/1-liban would be /lorientlejour/977-lebanon and /lorientlejour/1-liban respectively.
  :::`,
    radar: [
        {
            source: ['www.lorientlejour.com/*/:category'],
            target: '/:category',
        },
        {
            source: ['www.lorientlejour.com'],
            target: '/1-Liban',
        },
        {
            source: ['today.lorientlejour.com/*/:category'],
            target: '/:category',
        },
        {
            source: ['today.lorientlejour.com'],
            target: '/977-Lebanon',
        },
    ],
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '977-Lebanon';
    const limit = ctx.req.param('limit') ?? 25;

    const __dirname = getCurrentPath(import.meta.url);

    const regex = /^(\d+)/i;
    const categoryId = category.match(regex)[0] ?? category;

    const key = '3d5_f6A(S$G_FD=2S(Dr6%7BW_h37@rE';

    let token;
    const cacheIn = await cache.get('lorientlejour:token');
    if (cacheIn) {
        token = cacheIn;
    }
    if (token === undefined && config.lorientlejour.username && config.lorientlejour.password) {
        const loginUrl = `https://www.lorientlejour.com/cmsapi/visitors.php?key=${key}&action=login&loginName=${config.lorientlejour.username}&password=${config.lorientlejour.password}`;
        const loginResponse = await got(loginUrl);
        token = loginResponse.data.data.token;
        cache.set('lorientlejour:token', token);
    }
    if (token === undefined && config.lorientlejour.token) {
        token = config.lorientlejour.token;
        cache.set('lorientlejour:token', token);
    }

    if (token) {
        try {
            await got(`https://www.lorientlejour.com/cmsapi/visitors.php?key=${key}&action=login_token&token=${token}`);
        } catch (error) {
            if (error instanceof FetchError && error.statusCode === 403) {
                await cache.set('lorientlejour:token', '');
            }
            throw error;
        }
    }

    let categoryUrl = `https://www.lorientlejour.com/cmsapi/categories.php?key=${key}&action=view&categoryId=${categoryId}`;
    if (token) {
        categoryUrl = categoryUrl + `&token=${token}`;
    }
    const categoryResponse = await cache.tryGet(
        categoryUrl,
        async () =>
            await got({
                method: 'get',
                url: categoryUrl,
            }),
        config.cache.routeExpire,
        false
    );
    const categoryInfo = categoryResponse.data.data[0];
    let language = '';
    if (categoryInfo.typeId.locale) {
        language = categoryInfo.typeId.locale;
    }
    if (language === '') {
        language = categoryInfo.typeId.name === 'English' ? 'en-US' : 'fr-FR';
    }
    let title = `L'Orient Le Jour`;
    if (language === 'en-US') {
        title = `L'Orient Today`;
    }

    let url = `https://www.lorientlejour.com/cmsapi/content.php?text=clean&key=${key}&action=search&category=${categoryId}&limit=${limit}&text=false&page=1&includeSubcategories=1`;
    if (token) {
        url = url + `&token=${token}`;
    }
    const response = await got(url);
    const items = response.data.data.map((item) => {
        item.link = item.url;
        item.author = item.authors.map((author) => author.name).join(', ');
        item.pubDate = timezone(parseDate(item.firstPublished), +3);
        item.updated = timezone(parseDate(item.lastUpdate), +3);
        item.category = item.categories.map((itemCategory) => itemCategory.name);
        const contents = item.contents;
        const $ = load(contents);
        const article = $('html');
        article.find('.inline-embeded-article').remove();
        article.find('.relatedArticles').remove();
        if (item.inline_attachments) {
            article.find('.inlineImage').each(function () {
                const inlineImageSrc = $(this).attr('src');
                const inlineAttachment = item.inline_attachments.find((inlineAttachment) => inlineAttachment.url === inlineImageSrc);
                if (inlineAttachment && inlineAttachment.description) {
                    $(this).wrap('<figure></figure>');
                    $(this).after(`<figcaption>${inlineAttachment.description}</figcaption>`);
                }
            });
        }
        item.description = art(path.join(__dirname, 'templates/description.art'), {
            summary: item.summary,
            attachments: item.attachments,
            article: article.html(),
        });
        return item;
    });

    return {
        title: `${title} - ${categoryInfo.name}`,
        description: categoryInfo.description,
        language,
        link: categoryInfo.url,
        item: items,
    };
}
