import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

const defaultDomain = 'jmcomic1.me';
// list of address: https://jmcomic2.bet
const allowDomain = new Set(['18comic.vip', '18comic.org', 'jmcomic.me', 'jmcomic1.me', 'jm-comic3.art', 'jm-comic.club', 'jm-comic2.ark']);

const getRootUrl = (domain) => {
    if (!config.feature.allow_user_supply_unsafe_domain && !allowDomain.has(domain)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    return `https://${domain}`;
};

const ProcessItems = async (ctx, currentUrl, rootUrl) => {
    currentUrl = currentUrl.replace(/\?$/, '');

    const response = await got(currentUrl);

    const $ = load(response.data);

    let items = $('.video-title')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text().trim(),
                link: `${rootUrl}${item.prev().find('a').attr('href')}`,
                guid: `18comic:${item.prev().find('a').attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.guid, async () => {
                const detailResponse = await got(item.link);

                const content = load(detailResponse.data);

                item.pubDate = parseDate(content('div[itemprop="datePublished"]').first().attr('content'));
                item.updated = parseDate(content('div[itemprop="datePublished"]').last().attr('content'));
                item.category = content('span[data-type="tags"]')
                    .first()
                    .find('a')
                    .toArray()
                    .map((c) => $(c).text());
                item.author = content('span[data-type="author"]')
                    .first()
                    .find('a')
                    .toArray()
                    .map((a) => $(a).text())
                    .join(', ');
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    introduction: content('#intro-block .p-t-5').text(),
                    images: content('.img_zoom_img img')
                        .toArray()
                        .map((image) => content(image).attr('data-original')),
                    cover: content('.thumb-overlay img').first().attr('src'),
                    category: item.category,
                });

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        description: $('meta[property="og:description"]').attr('content'),
        allowEmpty: true,
    };
};

export { defaultDomain, getRootUrl, ProcessItems };
