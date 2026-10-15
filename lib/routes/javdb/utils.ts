import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit, hasItemFilters } from '@/utils/route-limit';

const allowDomain = new Set(['javdb.com', 'javdb571.com', 'javdb36.com', 'javdb007.com', 'javdb521.com']);

const processItems = async (ctx, currentUrl, title) => {
    const domain = ctx.req.query('domain') ?? 'javdb.com';
    const url = new URL(currentUrl, `https://${domain}`);
    if (!config.feature.allow_user_supply_unsafe_domain && !allowDomain.has(url.hostname)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const rootUrl = `https://${domain}`;

    const headers = config.javdb.session ? { cookie: `_jdb_session=${config.javdb.session}` } : undefined;
    const response = await ofetch(url.href, { headers });

    const $ = load(response);

    $('.tags, .tag-can-play, .over18-modal').remove();

    const limit = getRouteLimit(ctx, 20);
    let items = $('div.item')
        .slice(0, Math.max(20, limit))
        .toArray()
        .map((item): DataItem => {
            const element = $(item);
            return {
                title: element.find('.video-title').text(),
                link: `${rootUrl}${element.find('.box').attr('href')}`,
                pubDate: parseDate(element.find('.meta').text()),
            };
        });

    if (!hasItemFilters(ctx)) {
        if (ctx.req.query('limit') && ctx.req.query('sorted') !== 'false' && items.every((item) => item.pubDate && Number.isFinite(new Date(item.pubDate).getTime()))) {
            items.sort((a, b) => new Date(b.pubDate!).getTime() - new Date(a.pubDate!).getTime());
        }
        // Keep the default candidate pool when a source date is unavailable.
        if (ctx.req.query('sorted') === 'false' || !ctx.req.query('limit') || items.every((item) => item.pubDate && Number.isFinite(new Date(item.pubDate).getTime()))) {
            items = items.slice(0, limit);
        }
    }

    items = await pMap(
        items,
        async (item) => ({
            ...(await cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!, { headers });

                const content = load(detailResponse);

                const enclosureUrl = content('#magnets-content button[data-clipboard-text]').attr('data-clipboard-text');

                content('icon').remove();
                content('#modal-review-watched, #modal-comment-warning, #modal-save-list').remove();
                content('.review-buttons, .copy-to-clipboard, .preview-video-container, .play-button').remove();

                content('.preview-images img').each((_, el) => {
                    content(el).removeAttr('data-src');
                    content(el).attr('src', content(el).parent().attr('href'));
                });

                const category = content('.panel-block .value a')
                    .toArray()
                    .map((v) => content(v).text());
                const author = content('.panel-block .value').last().parent().find('.value a').first().text();
                const description = content('.cover-container, .column-video-cover').html()! + content('.movie-panel-info').html()! + content('#magnets-content').html() + content('.preview-images').html();

                return { description, author, category, enclosure_type: 'application/x-bittorrent', enclosure_url: enclosureUrl };
            })),
            ...item,
        }),
        { concurrency: 2 }
    );

    const htmlTitle = $('title').text();
    const subject = htmlTitle.includes('|') ? htmlTitle.split('|', 1)[0] : '';

    return {
        title: subject === '' ? title : `${subject} - ${title}`,
        link: url.href,
        item: items,
    };
};

export default { ProcessItems: processItems };
