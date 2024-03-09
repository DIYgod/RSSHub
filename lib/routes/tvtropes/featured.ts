import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import * as path from 'node:path';

const categories = {
    today: 'left',
    newest: 'right',
};

export default async (ctx) => {
    const { category = 'today' } = ctx.req.param();

    const rootUrl = 'https://tvtropes.org';

    const { data: response } = await got(rootUrl);

    const $ = load(response);

    const item = $(`div#featured-tropes div.${categories[category]}`);

    const link = new URL(item.find('h2.entry-title a').prop('href'), rootUrl).href;

    const { data: detailResponse } = await got(link);

    const content = load(detailResponse);

    content('div.folderlabel').remove();

    content('div.lazy_load_img_box').each((_, el) => {
        el = content(el);

        const image = el.find('img');

        el.replaceWith(
            art(path.join(__dirname, 'templates/description.art'), {
                images: [
                    {
                        src: image.prop('src'),
                        alt: image.prop('alt'),
                        width: image.prop('width'),
                        height: image.prop('height'),
                    },
                ],
            })
        );
    });

    const items = [
        {
            title: item.find('h2.entry-title').text(),
            link,
            description: content('div#main-article').html(),
        },
    ];

    const image = new URL($('img.logo-big').prop('src'), rootUrl).href;
    const icon = $('link[rel="shortcut icon"]').prop('href');

    ctx.set('data', {
        item: items,
        title: `${$('title').text()} - ${item.find('span.box-title').text()}`,
        link: rootUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        icon,
        logo: icon,
        subtitle: $('meta[property="og:title"]').prop('content'),
        author: $('meta[property="og:site_name"]').prop('content'),
        allowEmpty: true,
    });
};
