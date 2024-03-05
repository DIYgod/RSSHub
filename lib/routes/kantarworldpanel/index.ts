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
    const { region = 'cn-en', category = 'news' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://www.kantarworldpanel.com/';
    const currentUrl = new URL(`${region}/${category}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('ul.slide, #newssource')
        .find('li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');
            const image = item.find('img');

            const title = item.find('h3.mediumFont').text().trim();

            let link = a.prop('href');
            link = link === '#' ? currentUrl : link;

            return {
                title,
                link,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    description: item.find('p.gowhite').text(),
                    image: image.prop('src')
                        ? {
                              src: image.prop('src'),
                              alt: image.prop('alt'),
                          }
                        : undefined,
                }),
                guid: link.startsWith(rootUrl) ? `${link}#${title}` : link,
                pubDate: parseDate(item.find('p.medGrey').text(), 'DD/MM/YYYY'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                // The URL similar to the example below is the file download URL.
                // eg. https://www.kantarworldpanel.com/dwl.php?sn=publications&id=1632.
                if (item.link === currentUrl || !item.link.startsWith(rootUrl)) {
                    return item;
                } else if (/dwl\.php/.test(item.link)) {
                    item.enclosure_url = item.link;
                    item.enclosure_type = 'application/pdf';

                    return item;
                }

                const detailResponse = await got(item.link);

                if (!detailResponse.url.startsWith(rootUrl)) {
                    return item;
                }

                const content = load(detailResponse.data);

                item.title = content('h1.newshead').text();
                item.description = content('div.center-content div.left-layout-col').html();
                item.category = content('meta[name="keywords"]').prop('content')?.split(/,\s?/) ?? [];
                item.pubDate = parseDate(content('p.newsdateshare').text(), 'DD/MM/YYYY');

                return item;
            })
        )
    );

    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.set('data', {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image: $('#logoprint img').prop('src'),
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        allowEmpty: true,
    });
};
