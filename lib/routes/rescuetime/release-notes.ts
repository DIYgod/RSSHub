import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/release-notes/:os?',
    categories: ['program-update'],
    example: '/rescuetime/release-notes',
    parameters: { os: 'OS id, see below' },
    name: 'Release Notes',
    maintainers: ['nczitzk'],
    description: `| Mac OS | Windows |
| ------ | ------- |
| mac    | windows |`,
    handler,
};

async function handler(ctx: Context) {
    const { os = 'mac' } = ctx.req.param();

    const rootUrl = 'https://www.rescuetime.com/release-notes';
    const currentUrl = `${rootUrl}/${os}`;
    const response = await ofetch(currentUrl);

    const $ = load(response.replaceAll('<h3 align="left">', '</content><content><h3 align="left">'));

    const items = $('.release')
        .toArray()
        .map((item) => {
            const $item = $(item);

            const title = $item.find('h2').text();
            $item.find('h2').remove();

            return {
                title,
                link: currentUrl,
                description: $item.html(),
                pubDate: parseDate(title.match(/(\d{4}(?:\/\d{2}){2})/)![1], 'YYYY/MM/DD'),
            };
        });

    return {
        title: $('h1').text(),
        link: currentUrl,
        item: items,
    };
}
