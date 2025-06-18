import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
import { Cookie, CookieJar } from 'tough-cookie';

import ConfigNotFoundError from '@/errors/types/config-not-found';
import { DataItem } from '@/types';
const allowDomain = new Set(['javdb.com', 'javdb36.com', 'javdb007.com', 'javdb521.com']);
const itemCategoryRegex = /c(\d+)=(\d+)/;

const ProcessItems = async (ctx, currentUrl, title, excludeTags = new Set()) => {
    const domain = ctx.req.query('domain') ?? 'javdb.com';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;
    const url = new URL(currentUrl, `https://${domain}`);
    if (!config.feature.allow_user_supply_unsafe_domain && !allowDomain.has(url.hostname)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const rootUrl = `https://${domain}`;

    const cookieJar = new CookieJar();

    if (config.javdb.session) {
        const cookie = Cookie.fromJSON({
            key: '_jdb_session',
            value: config.javdb.session,
            domain,
            path: '/',
        });
        cookie && cookieJar.setCookie(cookie, rootUrl);
    }

    const results = [] as DataItem[];
    const batchSize = excludeTags.size > 0 ? 5 : limit;
    const subject = await processPages(rootUrl, url, 1, cookieJar, batchSize, limit, excludeTags, results);

    return {
        title: subject === '' ? title : `${subject} - ${title}`,
        link: url.href,
        item: results,
    };
};

const processPages = async (rootUrl, url, page, cookieJar, batchSize, limit, excludeTags, results) => {
    url.searchParams.set('page', String(page));

    const response = await got({
        method: 'get',
        url: url.href,
        cookieJar,
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const $ = load(response.data);

    $('.tags, .tag-can-play, .over18-modal').remove();

    const items = $('div.item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.video-title').text(),
                link: `${rootUrl}${item.find('.box').attr('href')}`,
                pubDate: parseDate(item.find('.meta').text()),
            };
        });

    if (items.length === 0) {
        return null;
    }

    await processSinglePage(cookieJar, items, 0, limit, batchSize, excludeTags, results);

    if ($('a.pagination-next').length !== 0 && results.length < limit) {
        await processPages(rootUrl, url, page + 1, cookieJar, batchSize, limit, excludeTags, results);
    }

    if (page !== 1) {
        return null;
    }

    const htmlTitle = $('title').text();
    return htmlTitle.includes('|') ? htmlTitle.split('|')[0] : '';
};

const processSinglePage = async (cookieJar, items, index, limit, batchSize, excludeTags, results) => {
    if (index >= items.length) {
        return;
    }

    let batch = items.slice(index, index + batchSize);

    batch = await Promise.all(
        batch.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    cookieJar,
                    headers: {
                        'User-Agent': config.trueUA,
                    },
                });

                const content = load(detailResponse.data);

                item.enclosure_type = 'application/x-bittorrent';
                item.enclosure_url = content('#magnets-content button[data-clipboard-text]').first().attr('data-clipboard-text');

                content('icon').remove();
                content('#modal-review-watched, #modal-comment-warning, #modal-save-list').remove();
                content('.review-buttons, .copy-to-clipboard, .preview-video-container, .play-button').remove();

                content('.preview-images img').each(function () {
                    content(this).removeAttr('data-src');
                    content(this).attr('src', content(this).parent().attr('href'));
                });

                const itemCategories = content('.panel-block .value a').toArray();
                const categoryIds: string[] = [];
                const category: string[] = [];
                for (const item_category of itemCategories) {
                    if ('href' in item_category.attribs) {
                        const match = item_category.attribs.href.match(itemCategoryRegex);
                        if (match !== null) {
                            categoryIds.push(match[2]);
                        }
                    }
                    category.push(content(item_category).text());
                }
                item.category = category;
                item.author = content('.panel-block .value').last().parent().find('.value a').first().text();
                item.description = content('.cover-container, .column-video-cover').html() + content('.movie-panel-info').html() + content('#magnets-content').html() + content('.preview-images').html();

                item._extra = {
                    category_ids: categoryIds,
                };

                return item;
            })
        )
    );
    for (const item of batch) {
        if (results.length >= limit) {
            break;
        }
        let shouldExclude = false;
        if (excludeTags.size > 0 && 'category_ids' in item._extra) {
            for (const categoryId of item._extra.category_ids) {
                if (excludeTags.has(categoryId)) {
                    shouldExclude = true;
                    break;
                }
            }
        }
        if (!shouldExclude) {
            results.push(item);
        }
    }

    if (results.length < limit) {
        await processSinglePage(cookieJar, items, index + batchSize, limit, batchSize, excludeTags, results);
    }
};

export default { ProcessItems };
