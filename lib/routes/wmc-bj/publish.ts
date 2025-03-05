import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/publish/:category{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { category = 'CRA-Reanalysis/2m-Temperature/6-hour/index.html' } = ctx.req.param();

    const rootUrl = 'http://www.wmc-bj.net';
    const currentUrl = new URL(`publish/${category}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const title = $('title').text();
    const author = 'World Meteorological Centre BeiJing';

    const img = $('#imgpath');
    const datetime = img.prop('data-time');
    const categories = $('ol.breadcrumb li')
        .slice(2)
        .toArray()
        .map((b) => $(b).text());

    const items = [
        {
            title: `${datetime} ${title}`,
            link: currentUrl,
            description: art(path.join(__dirname, 'templates/description.art'), {
                image: {
                    src: img.prop('src').replace(/\/medium\//, '/'),
                },
            }),
            category: categories,
            guid: `${currentUrl}#${datetime}`,
            pubDate: timezone(parseDate(/^[A-Za-z]{3}/.test(datetime) ? datetime.replace(/^\w+/, '') : datetime, ['DD MMM HH:mm', 'MM/DD HH:mm']), +0),
        },
    ];

    const image = 'http://image.nmc.cn/static/wmc/img/logo-cma.png';
    const icon = $('link[rel="shortcut icon"]').prop('href');

    return {
        item: items,
        title,
        link: currentUrl,
        language: 'en',
        image,
        icon,
        logo: icon,
        subtitle: categories.join(' > '),
        author,
        allowEmpty: true,
    };
}
