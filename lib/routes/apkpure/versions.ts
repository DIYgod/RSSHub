import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/versions/:pkg/:region?',
    categories: ['program-update'],
    example: '/apkpure/versions/jp.co.craftegg.band/jp',
    parameters: { pkg: 'Package name', region: 'Region code, `en` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Versions',
    maintainers: ['maple3142'],
    handler,
};

async function handler(ctx) {
    const { pkg, region = 'en' } = ctx.req.param();
    const baseUrl = 'https://apkpure.com';
    const link = `${baseUrl}/${region}/${pkg}/versions`;

    const r = await ofetch(link);

    const $ = load(r);
    const img = new URL($('.ver-top img').attr('src')!);
    img.searchParams.delete('w'); // get full resolution icon

    const items = $('.ver-wrap .ver_download_link')
        .toArray()
        .map((ver) => {
            const $ver = $(ver);
            return {
                title: $ver.find('.ver-item-n').text().replaceAll(/\s+/g, ' ').trim(),
                description: $ver.html(),
                link: $ver.find('a').attr('href'),
                pubDate: parseDate($ver.find('.update-on').text().replaceAll(/年|月/g, '-').replace('日', '')),
            };
        });

    return {
        title: $('.ver-top-r h1').text(),
        description: $('.ver-des').text(),
        image: img.href,
        language: region,
        link,
        item: items,
    };
}
